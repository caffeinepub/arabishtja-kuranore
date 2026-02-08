import { useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import LoginPage from './pages/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import MainLayout from './components/MainLayout';
import PWAInstallDialog from './components/PWAInstallDialog';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'initializing';

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  // Show login page if not authenticated
  if (!isAuthenticated && !isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LoginPage />
        <PWAInstallDialog />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show loading state during initialization
  if (isInitializing || profileLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Duke ngarkuar...</p>
          </div>
        </div>
        <PWAInstallDialog />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup if authenticated but no profile
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {showProfileSetup && <ProfileSetupModal />}
      {!showProfileSetup && <MainLayout />}
      <PWAInstallDialog />
      <Toaster />
    </ThemeProvider>
  );
}
