import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cx } from '../../utils';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={cx(
        'fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-mcd-gray-200 dark:border-mcd-gray-700/70 bg-white/90 text-mcd-gray-600 shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 hover:text-mcd-red dark:bg-mcd-gray-800/90 dark:text-mcd-gray-300 lg:bottom-6 lg:right-6',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
