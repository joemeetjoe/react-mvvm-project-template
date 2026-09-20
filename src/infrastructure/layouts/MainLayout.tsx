import { Outlet } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from '@/shared/ui/sidebar';
import { AppSidebar } from '@/infrastructure/components/app/AppSidebar';
import { AppNavbar } from '@/infrastructure/components/app/AppNavbar';
import { sidebarNavItems } from '@/infrastructure/constants/sidebarConfig';

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar items={sidebarNavItems} />
      <SidebarInset>
        <AppNavbar />
        <main className="flex flex-1 flex-col p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
