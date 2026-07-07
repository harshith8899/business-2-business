import { useEffect, useState } from 'react'

const DISMISS_KEY = 'pwa-install-dismissed-at'
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()

      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
      if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return

      setDeferredPrompt(e)
      // slight delay so it slides in after the page settles instead of popping in on load
      setTimeout(() => setVisible(true), 600)
    }

    const installedHandler = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
    }, 220)
  }

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setVisible(false)
    } else {
      dismiss()
    }
    setDeferredPrompt(null)
  }

  if (!deferredPrompt || !visible) return null

  return (
    <>
      <style>{`
        @keyframes pwa-slide-in {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pwa-slide-out {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to { transform: translateY(16px) scale(0.97); opacity: 0; }
        }
        .pwa-install-card {
          animation: pwa-slide-in 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pwa-install-card.closing {
          animation: pwa-slide-out 0.2s ease-in forwards;
        }
        .pwa-install-btn:hover {
          background: #24605f !important;
        }
        .pwa-dismiss-btn:hover {
          background: var(--color-border, #e2e8f0) !important;
          color: var(--color-text, #1a202c) !important;
        }
        @media (max-width: 480px) {
          .pwa-install-card {
            left: 12px !important;
            right: 12px !important;
            bottom: 12px !important;
            width: auto !important;
          }
        }
      `}</style>
      <div
        className={`pwa-install-card${closing ? ' closing' : ''}`}
        role="dialog"
        aria-label="Install app"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '340px',
          maxWidth: 'calc(100vw - 24px)',
          background: 'var(--color-bg, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(26, 32, 44, 0.14), 0 2px 8px rgba(26, 32, 44, 0.06)',
          padding: '18px',
          fontFamily: 'var(--font-system, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--color-accent, #2c7a7b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 3v12m0 0l-4-4m4 4l4-4M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: '14.5px',
                fontWeight: 600,
                color: 'var(--color-primary, #2d3748)',
                lineHeight: 1.35,
              }}
            >
              Install this app
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '13px',
                color: 'var(--color-text, #1a202c)',
                opacity: 0.7,
                lineHeight: 1.4,
              }}
            >
              Add it to your home screen for faster access and an app-like experience.
            </p>
          </div>

          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="pwa-dismiss-btn"
            style={{
              flexShrink: 0,
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text, #1a202c)',
              opacity: 0.45,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              lineHeight: 1,
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={dismiss}
            className="pwa-dismiss-btn"
            style={{
              flex: '0 0 auto',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #e2e8f0)',
              background: 'transparent',
              color: 'var(--color-primary, #2d3748)',
              fontSize: '13.5px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Not now
          </button>
          <button
            onClick={installApp}
            className="pwa-install-btn"
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--color-accent, #2c7a7b)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            Install app
          </button>
        </div>
      </div>
    </>
  )
}