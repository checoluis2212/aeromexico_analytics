'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotificationSettingsCard } from '@/components/account/notification-settings-card';

type ProfileSeed = {
  id: string;
  email: string;
  full_name: string | null;
};

export function ProfileSettings({ seed }: { seed: ProfileSeed }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [fullName, setFullName] = useState(seed.full_name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const showRecoveryHint = useMemo(() => mode === 'recovery', [mode]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() || null })
        .eq('id', seed.id);
      if (error) throw error;
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error('No se pudo guardar', { description: err instanceof Error ? err.message : 'Intenta de nuevo' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    const pass = newPassword.trim();
    if (pass.length < 8) {
      toast.error('Contraseña muy corta', { description: 'Usa al menos 8 caracteres.' });
      return;
    }
    if (pass !== confirmPassword.trim()) {
      toast.error('No coincide', { description: 'Revisa la confirmación de contraseña.' });
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Contraseña actualizada');
    } catch (err) {
      toast.error('No se pudo actualizar', { description: err instanceof Error ? err.message : 'Intenta de nuevo' });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card premium-border">
        <CardHeader>
          <CardTitle className="text-base">Datos</CardTitle>
          <CardDescription>Lo básico para identificar tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input id="email" value={seed.email} disabled className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="full_name">Nombre (opcional)</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5"
              placeholder="Ej: Ana López"
            />
          </div>
          <Button onClick={saveProfile} disabled={savingProfile} className="glow-aero">
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card premium-border">
        <CardHeader>
          <CardTitle className="text-base">Seguridad</CardTitle>
          <CardDescription>Cambia tu contraseña cuando lo necesites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showRecoveryHint && (
            <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              Abre esta pantalla desde el correo de recuperación y define una contraseña nueva.
            </div>
          )}
          <div>
            <Label htmlFor="new_password">Nueva contraseña</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <Label htmlFor="confirm_password">Confirmar contraseña</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5"
              autoComplete="new-password"
            />
          </div>
          <Button variant="outline" onClick={changePassword} disabled={savingPassword}>
            Guardar contraseña
          </Button>
        </CardContent>
      </Card>

      <NotificationSettingsCard />
    </div>
  );
}

