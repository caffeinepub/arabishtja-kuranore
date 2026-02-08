import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useUpdateProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Upload, User } from 'lucide-react';
import { ExternalBlob } from '../backend';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      if (userProfile.avatar) {
        setAvatarPreview(userProfile.avatar.getDirectURL());
      }
    }
  }, [userProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imazhi duhet të jetë më i vogël se 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Emri nuk mund të jetë bosh');
      return;
    }

    try {
      let avatarBlob: ExternalBlob | null = null;

      if (avatarFile) {
        const arrayBuffer = await avatarFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        avatarBlob = ExternalBlob.fromBytes(uint8Array);
      } else if (userProfile?.avatar) {
        avatarBlob = userProfile.avatar;
      }

      await updateProfile.mutateAsync({ name: name.trim(), avatar: avatarBlob });
      toast.success('Profili u përditësua me sukses!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Gabim gjatë përditësimit të profilit');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profili im</DialogTitle>
          <DialogDescription>
            Përditësoni informacionet tuaja personale
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={avatarPreview || undefined} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {name ? getInitials(name) : <User className="w-12 h-12" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Ngarko imazh</span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={updateProfile.isPending}
                />
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Emri</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emri juaj"
              disabled={updateProfile.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Roli</Label>
            <Input value={userProfile?.role || ''} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Principal ID</Label>
            <Input
              value={userProfile?.principalId || ''}
              disabled
              className="bg-muted text-xs font-mono"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={updateProfile.isPending}
            >
              Anulo
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateProfile.isPending || !name.trim()}
            >
              {updateProfile.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Duke ruajtur...
                </>
              ) : (
                'Ruaj ndryshimet'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
