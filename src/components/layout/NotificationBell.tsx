'use client';

import { useState, useEffect, useRef } from 'react';
import { getUserNotifications, getAdminNotifications, markAsRead, markAllAsRead } from '@/actions/notification';
import { Notification } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface NotificationBellProps {
  isAdmin?: boolean;
  userId?: string;
}

export default function NotificationBell({ isAdmin = false, userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'unread' | 'all'>('unread');
  const [guestId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined' && !isAdmin && !userId) {
      return localStorage.getItem('chat_guest_id') || undefined;
    }
    return undefined;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations('Notifications');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayedNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const decodeMessage = (raw: string): string => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.key === 'new_support_message') return t('new_support_message');
      if (parsed.key === 'new_chat_from') return t('new_chat_from', { name: parsed.name });
      if (parsed.key === 'new_order_from') return t('new_order_from', { name: parsed.name, amount: parsed.amount });
      return raw;
    } catch {
      return raw;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        let data: Notification[] = [];
        if (isAdmin) {
          data = await getAdminNotifications();
        } else if (userId || guestId) {
          data = await getUserNotifications(userId, guestId);
        }

        if (!isMounted) return;

        setNotifications(prev => {
          const prevUnreadIds = new Set(prev.filter(n => !n.isRead).map(n => n.id));
          const currentUnread = data.filter(n => !n.isRead);

          let hasNew = false;
          for (const n of currentUnread) {
            if (!prevUnreadIds.has(n.id)) { hasNew = true; break; }
          }

          if (hasNew && prev.length > 0) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          }

          return data;
        });
      } catch (e) {
        console.error(e);
      }
    };

    void loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin, userId, guestId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update: mark read immediately so it vanishes from unread filter
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await markAsRead(id);
    } catch (e) {
      console.error('[NotificationBell] Failed to mark notification as read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update: mark all read immediately
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await markAllAsRead(isAdmin, userId, guestId);
    } catch (e) {
      console.error('[NotificationBell] Failed to mark all as read:', e);
    }
  };

  const handleItemClick = async (n: Notification) => {
    if (!n.isRead) {
      await handleMarkAsRead(n.id);
    }
    if (n.link) {
      setIsOpen(false);
      router.push(n.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 text-gray-600 hover:text-orange-700 transition focus:outline-none flex items-center justify-center rounded-lg hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-20 mx-auto max-w-xs sm:max-w-none sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-88 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 bg-gray-50/90 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">{t('title')}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead} 
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold transition"
              >
                {t('mark_all_read')}
              </button>
            )}
          </div>

          {/* Filter Tabs: Non lues / Toutes */}
          <div className="flex border-b border-gray-200/80 bg-gray-50/40 px-3 pt-2 gap-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`pb-2 px-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
                filter === 'unread'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{t('tab_unread')}</span>
              {unreadCount > 0 && (
                <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`pb-2 px-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
                filter === 'all'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{t('tab_all')}</span>
              <span className="text-[10px] text-gray-400 font-normal">
                ({notifications.length})
              </span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                <div className="w-10 h-10 mx-auto text-gray-300 mb-2.5 flex items-center justify-center rounded-full bg-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="font-medium text-gray-600">
                  {filter === 'unread' ? t('no_unread') : t('no_notifications')}
                </p>
                {filter === 'unread' && notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className="text-xs text-orange-600 hover:underline mt-2 font-semibold block mx-auto"
                  >
                    {t('tab_all')} ({notifications.length}) &rarr;
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {displayedNotifications.map(n => (
                  <li 
                    key={n.id} 
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 transition cursor-pointer flex items-start justify-between gap-3 ${
                      n.isRead ? 'bg-white hover:bg-gray-50/80 text-gray-600' : 'bg-orange-50/50 hover:bg-orange-50 text-gray-900'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {n.type === 'CHAT' && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                            {t('label_chat')}
                          </span>
                        )}
                        {n.type === 'ORDER' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                            {t('label_order')}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-sm leading-snug ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                        {decodeMessage(n.message)}
                      </p>
                      {n.link && (
                        <span className="text-xs text-orange-700 font-semibold mt-1.5 inline-flex items-center gap-1 hover:underline">
                          {t('view_details')} &rarr;
                        </span>
                      )}
                    </div>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(n.id);
                        }}
                        className="p-1 rounded-full text-orange-600 hover:bg-orange-100 transition flex-shrink-0 mt-0.5"
                        title={t('mark_as_read')}
                        aria-label={t('mark_as_read')}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-600 block shadow-sm" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
