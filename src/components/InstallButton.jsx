import { useEffect, useState } from 'react'

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    console.log('Install outcome:', outcome)

    setDeferredPrompt(null)
  }

  if (!deferredPrompt) return null

  return (
    <button
      onClick={installApp}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        padding: '10px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        background: '#2563eb',
        color: '#fff',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      📲 Install App
    </button>
  )
}