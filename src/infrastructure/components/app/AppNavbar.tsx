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
    <header className="flex items-center gap-2 h-16 px-4 border-b">
      <SidebarTrigger className="h-6 w-6" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Log out
      </Button>
    </header>
  );
};
