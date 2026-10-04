import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, CheckCircle2, QrCode as QrIcon } from 'lucide-react';

export interface RealQRCodeProps {
  /** The value/URL/payload encoded in the QR code */
  value: string;
  /** Size in pixels (width and height) */
  size?: number;
  /** Foreground module color */
  fgColor?: string;
  /** Background color */
  bgColor?: string;
  /** Error correction level */
  level?: 'L' | 'M' | 'Q' | 'H';
  /** Margin/quiet zone size in modules */
  margin?: number;
  /** Optional center logo text or image */
  centerLogo?: string;
  /** Optional caption rendered beneath */
  caption?: string;
  /** Show one-click download PNG button on hover */
  downloadable?: boolean;
  /** Show one-click copy payload button */
  copyable?: boolean;
  /** Custom CSS classes for the container */
  className?: string;
  /** Alt attribute for the rendered image */
  alt?: string;
}

export const RealQRCode: React.FC<RealQRCodeProps> = ({
  value,
  size = 160,
  fgColor = '#002561',
  bgColor = '#ffffff',
  level = 'M',
  margin = 2,
  centerLogo,
  caption,
  downloadable = false,
  copyable = false,
  className = '',
  alt = 'Chanakya University Official QR Code',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: size * 2, // 2x density for retina display sharpness
      margin: margin,
      errorCorrectionLevel: level,
      color: {
        dark: fgColor.endsWith('ff') || fgColor.length === 7 ? fgColor : fgColor,
        light: bgColor,
      },
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to generate real QR code:', err);
          setError('QR generation error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, fgColor, bgColor, level, margin]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `chanakya_qr_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div 
        className="relative group rounded-xl overflow-hidden bg-white shadow-xs border border-gray-200/80 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <>
            <img
              src={dataUrl}
              alt={alt}
              className="w-full h-full object-contain"
              style={{ width: size, height: size }}
            />
            {centerLogo && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-md border border-cu-gold/60 flex items-center justify-center p-0.5">
                  <span className="font-serif font-black text-cu-navy text-[9px] tracking-tight">
                    {centerLogo}
                  </span>
                </div>
              </div>
            )}
            
            {/* Quick Action Overlay on Hover */}
            {(downloadable || copyable) && (
              <div className="absolute inset-0 bg-cu-navy/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                {copyable && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition text-[10px] flex items-center gap-1"
                    title="Copy QR Payload"
                  >
                    {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                )}
                {downloadable && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition text-[10px] flex items-center gap-1"
                    title="Download High-Res QR (PNG)"
                  >
                    <Download size={13} />
                  </button>
                )}
              </div>
            )}
          </>
        ) : error ? (
          <div className="text-center p-2 text-red-500 text-[10px] font-mono">
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 animate-pulse">
            <QrIcon size={size * 0.4} />
          </div>
        )}
      </div>

      {caption && (
        <div className="text-[10px] font-mono text-gray-500 text-center mt-1 max-w-[200px] truncate">
          {caption}
        </div>
      )}
    </div>
  );
};
