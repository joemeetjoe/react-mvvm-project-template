import { Users, LayoutDashboard } from 'lucide-react';
import type { SidebarNavItem } from '@/infrastructure/components/app/AppSidebar';

export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: 'Users',
    icon: Users,
    path: '/users',
  },
  // Add new feature nav items here
];
