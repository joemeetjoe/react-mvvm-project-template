import type { ReactElement } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { SidebarTrigger } from '@/shared/ui/sidebar';
import { useSessionStore } from '@/shared/stores/sessionStore';

export const AppNavbar = (): ReactElement => {
  const navigate = useNavigate();
  const clearSession = useSessionStore((state) => state.clearSession);

  const handleLogout = (): void => {
    clearSession();
    void navigate({ to: '/' });
  };

  return (
    <>
      <header className="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </header>
      <Separator />
    </>
  );
};
