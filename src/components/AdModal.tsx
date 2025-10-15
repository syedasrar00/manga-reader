import { useEffect, useState } from "react";

/**
 * AdModal
 * - Shows a small modal prompting users to click an ad link to support the site.
 * - When the ad is clicked we store a timestamp in localStorage under
 *   `lastAdClickTimestamp` and hide the modal for 24 hours.
 * - This is a client-side, best-effort suppression using localStorage and can be
 *   cleared by the user or expire after 24 hours.
 */
const LAST_AD_CLICK_KEY = "lastAdClickTimestamp";
const HIDE_HOURS = 24;

export default function AdModal(): JSX.Element | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_AD_CLICK_KEY);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (!isNaN(ts)) {
          const diff = Date.now() - ts;
          if (diff < HIDE_HOURS * 60 * 60 * 1000) {
            setVisible(false);
            return;
          }
        }
      }
    } catch {
      // ignore localStorage errors
    }
    setVisible(true);
  }, []);

  const handleAdClick = () => {
    try {
      localStorage.setItem(LAST_AD_CLICK_KEY, Date.now().toString());
    } catch {
      // ignore
    }
    setVisible(false);
    // allow link to open in new tab
  };

  // Note: modal intentionally cannot be closed by the user. It will only
  // be dismissed when the ad link is clicked (handleAdClick).

  // Disable background scroll and trap focus while modal visible
  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const modal = document.getElementById("ad-modal");
    const focusableSelectors = [
      'a[href]', 'button', 'textarea', 'input', 'select', '[tabindex]'
    ];

    const focusable: HTMLElement[] = [];
    if (modal) {
      focusable.push(...Array.from(modal.querySelectorAll(focusableSelectors.join(','))) as HTMLElement[]);
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent Escape from closing
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Trap focus inside modal
      if (e.key === 'Tab') {
        if (!first || !last) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    // Focus the first focusable element (the ad button/link) if present
    const timer = setTimeout(() => {
      if (first) first.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed h-full w-full bg-gray-900 bg-opacity-75 z-1000">
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        id="ad-modal"
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full mx-4 p-6 z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-modal-title"
      >
        <h2 className="text-xl text-gray-700 dark:text-gray-300 font-semibold mb-2">
          Support the site
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Clicking the ad helps generate revenue to maintain the website. Click
          once per day and enjoy free manhwas. Thank you for your support!
        </p>
        <a
          href="https://www.effectivegatecpm.com/v4f4smn5?key=08ba7df4167600a2bba7ecf5b05b4803"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAdClick}
        >
          <img src="ad_image.png" alt="Ad" className="m-auto" />
        </a>
        <div className="flex gap-3">
          <a
            href="https://www.effectivegatecpm.com/v4f4smn5?key=08ba7df4167600a2bba7ecf5b05b4803"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAdClick}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue mx-auto my-8"
          >
            Click to support (Ad)
          </a>
        </div>
      </div>
    </div>
    </div>
  );
}
