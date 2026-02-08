import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';

export default function Header() {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = async () => {
    try {
      await clear();
      queryClient.clear();
      toast.success('U shkëputët me sukses');
    } catch (error) {
      toast.error('Gabim gjatë shkëputjes');
      console.error(error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = userProfile?.avatar?.getDirectURL();

  return (
    <>
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/icon.png" alt="Logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Arabishtja Kuranore</h1>
              <p className="text-xs text-muted-foreground">Mjet mësimor interaktiv</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                <Avatar className="w-10 h-10 cursor-pointer border-2 border-primary/20 hover:border-primary transition-colors">
                  <AvatarImage src={avatarUrl} alt={userProfile?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {userProfile?.name ? getInitials(userProfile.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile?.name}</p>
                  <p className="text-xs text-muted-foreground">{userProfile?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                <User className="mr-2 h-4 w-4" />
                Profili
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Cilësimet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Shkyçu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
