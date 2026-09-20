import { SidebarTrigger } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';

export const AppNavbar = () => {
  return (
    <header className="flex items-center gap-2 h-16 px-4 border-b">
      <SidebarTrigger className="h-6 w-6" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
    </header>
  );
};
