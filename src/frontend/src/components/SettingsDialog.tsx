import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Moon, Sun, Trash2 } from 'lucide-react';
import { useIsCallerAdmin, useResetAppData } from '@/hooks/useQueries';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const resetAppData = useResetAppData();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetAppData = async () => {
    try {
      await resetAppData.mutateAsync();
      toast.success('Të dhënat e aplikacionit u rivendosën me sukses');
      setShowResetConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error resetting app data:', error);
      toast.error('Gabim gjatë rivendosjes së të dhënave');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cilësimet</DialogTitle>
            <DialogDescription>
              Personalizoni përvojën tuaj të aplikacionit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Mënyra e errët
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Aktivizo temën e errët
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {!isAdminLoading && isAdmin && (
              <>
                <div className="border-t pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5 text-destructive" />
                      <Label className="text-base font-medium text-destructive">
                        Zona e Rrezikshme
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Veprime që ndryshojnë në mënyrë permanente të dhënat e aplikacionit
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowResetConfirm(true)}
                      disabled={resetAppData.isPending}
                      className="w-full"
                    >
                      {resetAppData.isPending ? 'Duke rivendosur...' : 'Rivendos të Dhënat e Aplikacionit'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeni i sigurt që dëshironi të rivendosni të gjitha të dhënat e aplikacionit?</AlertDialogTitle>
            <AlertDialogDescription>
              Ky veprim nuk mund të zhbëhet. Kjo do të fshijë në mënyrë permanente të gjitha të dhënat duke përfshirë:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Të gjitha profilet e përdoruesve</li>
                <li>Të gjitha mësimet dhe përmbajtjen</li>
                <li>Të gjithë fjalorin</li>
                <li>Të gjitha shënimet</li>
                <li>Të gjitha rolet dhe lejet</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAppData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Po, Rivendos të Gjitha të Dhënat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
