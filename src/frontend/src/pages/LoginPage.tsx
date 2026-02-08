import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <img src="/assets/icon.png" alt="Logo" className="w-20 h-20 rounded-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Arabishtja Kuranore</h1>
          <p className="text-lg text-muted-foreground">
            Mjet mësimor interaktiv për arabishten kuranore
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="space-y-6">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <BookOpen className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
              <p>
                Mirë se vini në platformën tonë të mësimit të arabishtjes kuranore. 
                Kyçuni për të filluar udhëtimin tuaj arsimor.
              </p>
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Duke u kyçur...
                </>
              ) : (
                'Kyçu me Internet Identity'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Duke u kyçur, ju pranoni kushtet tona të shërbimit
            </p>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          © 2025. Built with love using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
