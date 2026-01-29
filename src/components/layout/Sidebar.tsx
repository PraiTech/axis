import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Receipt, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Target, 
  ShoppingCart, 
  Settings,
  ChevronLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import logger from '@/lib/logger';

// Функция для предзагрузки маршрута
function prefetchRoute(routePath: string) {
  const componentName = routePath === '/' 
    ? 'Dashboard' 
    : routePath.slice(1).charAt(0).toUpperCase() + routePath.slice(2);
  
  // Предзагружаем компонент
  import(`@/pages/${componentName}`).catch(() => {
    // Игнорируем ошибки
  });
}

const navigationGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Clients',
    items: [
      { name: 'Clients', path: '/clients', icon: Users },
    ],
  },
  {
    label: 'Finances',
    items: [
      { name: 'Payments', path: '/payments', icon: Wallet },
      { name: 'Transactions', path: '/transactions', icon: Receipt },
      { name: 'Invoices', path: '/invoices', icon: FileText },
    ],
  },
  {
    label: 'Planning',
    items: [
      { name: 'Schedule', path: '/schedule', icon: Calendar },
    ],
  },
  {
    label: 'Investments',
    items: [
      { name: 'Investment', path: '/investment', icon: TrendingUp },
      { name: 'Goals', path: '/goals', icon: Target },
    ],
  },
  {
    label: 'Orders',
    items: [
      { name: 'Orders', path: '/orders', icon: ShoppingCart },
    ],
  },
  {
    label: 'Settings',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    logger.componentMount('Sidebar');
    logger.info('UI', 'Sidebar initialized', {
      currentPath: location.pathname,
      collapsed: false
    }, 'Sidebar', 'INIT');
  }, []);

  useEffect(() => {
    logger.info('ROUTING', `Active menu item: ${location.pathname}`, {
      path: location.pathname
    }, 'Sidebar', 'NAVIGATION');
  }, [location]);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    logger.userAction('Sidebar', 'Toggling sidebar', {
      from: collapsed ? 'expanded' : 'collapsed',
      to: newCollapsed ? 'collapsed' : 'expanded'
    });
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const navGroups = Array.isArray(navigationGroups) ? navigationGroups : [];

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-full overflow-y-auto bg-gradient-to-b from-card to-card/95 border-r border-border shadow-lg transition-[width] duration-200 ease-out"
      style={{
        width: collapsed ? 80 : 256,
      }}
    >
      <div className="flex h-full flex-col">
        {/* Logo — фиксированная высота зоны, лого подстраивается */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/50 flex-shrink-0 bg-card/50">
          <div className="flex items-center min-w-0 flex-1 h-full max-h-[56px]">
            {!collapsed ? (
              <img src="/brand/logo.PNG" alt="Logo" className="max-h-full w-auto max-w-[400px] object-contain object-left" />
            ) : (
              <img src="/brand/logo.PNG" alt="Logo" className="max-h-full max-w-full w-auto object-contain object-center mx-auto flex-shrink-0" />
            )}
          </div>
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4" style={{ minHeight: 0 }}>
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground/90">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      onMouseEnter={() => prefetchRoute(item.path)}
                      onClick={() => {
                        logger.userAction('Sidebar', `Navigating to page: ${item.name}`, {
                          path: item.path,
                          name: item.name
                        });
                      }}
                      className={cn(
                        "flex items-center justify-start gap-3 pl-3 pr-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group min-h-[48px] relative overflow-hidden",
                        "border-l-4 border-transparent",
                        isActive
                          ? "bg-primary text-primary-foreground border-l-4 border-l-primary-foreground/50 hover:bg-primary/90"
                          : "text-foreground/85 sidebar-item-inset hover:bg-accent/40 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0 self-center relative z-10 transition-transform duration-200",
                        isActive && "text-primary-foreground scale-105",
                        !isActive && "group-hover:scale-105"
                      )} />
                      {!collapsed && (
                        <span
                          className={cn(
                            "truncate self-center leading-none relative z-10 font-medium",
                            isActive && "text-primary-foreground font-semibold"
                          )}
                        >
                          {item.name}
                        </span>
                      )}
                        {isActive && collapsed && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

      </div>
    </aside>
  );
}
