import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallDialog() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const hasUserDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

    if (isStandalone || isIOSStandalone || hasUserDismissed) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install popup
      setShowPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPopup(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        // User accepted the install prompt
        localStorage.setItem('pwa-install-dismissed', 'true');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowPopup(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPopup(false);
    setDeferredPrompt(null);
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={handleDismiss}
      />

      {/* Slide-up popup */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-background border-t border-border rounded-t-3xl shadow-2xl mx-auto max-w-lg">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            disabled={isInstalling}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Mbyll"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="p-6 pb-8">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <img
                src="/assets/icon.png"
                alt="Arabishtja Kuranore"
                className="w-16 h-16 rounded-2xl shadow-lg"
              />
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-center mb-2">
              Dëshiron ta instalosh aplikacionin?
            </h2>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center mb-6">
              Instalo Arabishtja Kuranore në pajisjen tënde për një përvojë më të mirë dhe akses të
              shpejtë.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={isInstalling}
                className="flex-1 h-12 text-base"
              >
                Jo
              </Button>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 h-12 text-base"
              >
                {isInstalling ? 'Duke instaluar...' : 'Po'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
