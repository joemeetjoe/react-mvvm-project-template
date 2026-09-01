import { SidebarTrigger } from '@/infrastructure/components/ui/sidebar';
import { Separator } from '@/infrastructure/components/ui/separator';

export const AppNavbar = () => {
  return (
    <header className="flex items-center gap-2 h-16 px-4 border-b">
      <SidebarTrigger className="h-6 w-6" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
    </header>
  );
};
