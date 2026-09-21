import { Users } from 'lucide-react';
// plop:sidebar-icon-import
import type { SidebarNavItem } from './AppSidebar';

export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: 'Users',
    icon: Users,
    path: '/users',
  },
  // Add new feature nav items here
];
