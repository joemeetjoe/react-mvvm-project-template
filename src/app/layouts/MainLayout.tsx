import { Outlet } from '@tanstack/react-router';
import { SidebarProvider, SidebarInset } from '@/shared/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppNavbar } from './AppNavbar';
import { sidebarNavItems } from './sidebarConfig';

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
