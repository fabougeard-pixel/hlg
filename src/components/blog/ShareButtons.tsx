'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ShareButtonsProps {
  url: string;
  title: string;
  shareLabel?: string;
}

export default function ShareButtons({ url, title, shareLabel }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare] = useState(() => {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  });
  const t = useTranslations('Blog');

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const openShareWindow = (targetUrl: string) => {
    if (typeof window !== 'undefined') {
      const width = 600;
      const height = 480;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      window.open(
        targetUrl,
        'share_dialog',
        `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no,width=${width},height=${height},top=${top},left=${left}`
      );
    }
  };

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch {
        // User dismissed the share sheet
      }
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      hoverClass: 'hover:bg-black hover:text-white hover:border-black',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      hoverClass: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      hoverClass: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="font-semibold text-gray-900 text-sm">{shareLabel || t('share')}</span>

      <div className="flex items-center gap-2">
        {shareLinks.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => openShareWindow(item.url)}
            title={`Partager sur ${item.name}`}
            aria-label={`Partager sur ${item.name}`}
            className={`w-9 h-9 rounded-full bg-gray-100 border border-gray-200/90 flex items-center justify-center text-gray-600 transition-all duration-200 cursor-pointer shadow-xs ${item.hoverClass}`}
          >
            {item.icon}
          </button>
        ))}

        {/* Copy link button */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? (t('link_copied') || 'Lien copié !') : 'Copier le lien'}
            aria-label="Copier le lien"
            className={`w-9 h-9 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-gray-100 border-gray-200/90 text-gray-600 hover:bg-orange-600 hover:text-white hover:border-orange-600'
            }`}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </button>

          {/* Feedback tooltip */}
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium py-0.5 px-2 rounded shadow-md whitespace-nowrap animate-in fade-in duration-150 z-20">
              {t('link_copied') || 'Lien copié !'}
            </span>
          )}
        </div>

        {/* Native Web Share button for mobile */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            title="Partager"
            aria-label="Partager via le système"
            className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200/90 flex items-center justify-center text-gray-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-200 cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
