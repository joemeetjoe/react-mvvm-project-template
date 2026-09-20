import { useState, useEffect } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';

import { Label } from '@/shared/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
  SidebarFooter,
} from '@/shared/ui/sidebar';
import { Switch } from '@/shared/ui/switch';
import { ScrollArea } from '@/shared/ui/scroll-area';

export interface SidebarNavItem {
  title: string;
  icon: LucideIcon;
  path: string;
  showFilter?: boolean;
  filterLabel?: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  items: SidebarNavItem[];
}

interface NavigationSidebarProps {
  items: SidebarNavItem[];
  activeItem: SidebarNavItem;
  setActiveItem: (item: SidebarNavItem) => void;
  setOpen: (open: boolean) => void;
}

interface ContentSidebarProps {
  activeItem: SidebarNavItem;
  filterEnabled: boolean;
  setFilterEnabled: (enabled: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AppSidebar = ({ items, ...props }: AppSidebarProps) => {
  const [activeItem, setActiveItem] = useState<SidebarNavItem>(items[0]);
  const { setOpen } = useSidebar();
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleItemClick = (item: SidebarNavItem) => {
    setActiveItem(item);
    setOpen(true);
    navigate({ to: item.path });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <NavigationSidebar
        items={items}
        activeItem={activeItem}
        setActiveItem={(item) => handleItemClick(item)}
        setOpen={setOpen}
      />
      <ContentSidebar
        activeItem={activeItem}
        filterEnabled={filterEnabled}
        setFilterEnabled={setFilterEnabled}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </Sidebar>
  );
};

const NavigationSidebar = ({ items, activeItem, setActiveItem, setOpen }: NavigationSidebarProps) => {
  return (
    <Sidebar collapsible="none" className="w-[var(--sidebar-width-icon)]!">
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={{ children: item.title, hidden: false }}
                onClick={() => setActiveItem(item)}
                isActive={activeItem?.title === item.title}
              >
                <item.icon />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
};

const ContentSidebar = ({
  activeItem,
  filterEnabled,
  setFilterEnabled,
  searchQuery,
  setSearchQuery,
}: ContentSidebarProps) => {
  useEffect(() => {
    setFilterEnabled(false);
  }, [activeItem.title, setFilterEnabled]);

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium text-foreground">
            {activeItem?.title}
          </div>
          {activeItem.showFilter && (
            <Label className="flex items-center gap-2 text-sm">
              <span>{activeItem.filterLabel || 'Filter'}</span>
              <Switch className="shadow-none" checked={filterEnabled} onCheckedChange={setFilterEnabled} />
            </Label>
          )}
        </div>
        <SidebarInput
          placeholder="Type to search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <div className="p-4 text-sm text-muted-foreground">
                {activeItem.title} content
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};
