import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth =
    size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 backdrop-blur-sm p-3 sm:items-center sm:p-6">
      <div
        className={`relative w-full ${maxWidth} animate-slide-up rounded-2xl bg-white shadow-lift`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <div className="px-6 pt-6 pb-2">
          <div className="font-display text-xl text-ink-900">{title}</div>
          {description && <div className="mt-1 text-sm text-ink-500">{description}</div>}
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/40 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
