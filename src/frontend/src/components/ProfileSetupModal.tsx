import { useState } from 'react';
import { useRegisterProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const registerProfile = useRegisterProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Ju lutem shkruani emrin tuaj');
      return;
    }

    try {
      await registerProfile.mutateAsync(name.trim());
      toast.success('Profili u krijua me sukses!');
    } catch (error) {
      toast.error('Gabim gjatë krijimit të profilit');
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Mirë se vini!</DialogTitle>
          <DialogDescription>
            Ju lutem shkruani emrin tuaj për të vazhduar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Emri juaj</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shkruani emrin tuaj"
              autoFocus
              disabled={registerProfile.isPending}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={registerProfile.isPending || !name.trim()}
          >
            {registerProfile.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Duke ruajtur...
              </>
            ) : (
              'Vazhdo'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
