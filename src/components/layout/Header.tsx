import { Search, Bell, Globe, LogOut, Check, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logger from '@/lib/logger';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Russian' },
  { code: 'es', label: 'Spanish' },
];

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('app_language') || 'en');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logger.componentMount('Header');
  }, []);

  useEffect(() => {
    if (searchQuery) {
      logger.userAction('Header', 'Search query', {
        query: searchQuery,
        length: searchQuery.length
      });
    }
  }, [searchQuery]);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('app_language', langCode);
    logger.userAction('Header', `Language selection: ${LANGUAGES.find(l => l.code === langCode)?.label}`, { language: langCode });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    logger.userAction('Header', 'Logout', undefined);
  };

  const getUserInitials = () => {
    if (!user?.email) return 'A';
    return user.email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
  };

  const currentLangLabel = LANGUAGES.find(l => l.code === currentLang)?.label || 'English';

  return (
    <header
      className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 h-[var(--header-h)] min-h-[56px]"
    >
      <div className="flex h-full items-center gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-accent transition-colors lg:hidden flex-shrink-0"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className="flex-1 min-w-0 max-w-md">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:pl-9 w-full text-fluid-sm min-w-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto flex-shrink-0">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={() => logger.userAction('Header', 'Opening language menu', undefined)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="text-fluid-sm hidden sm:inline">{currentLangLabel}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="flex justify-between items-center"
                >
                  {lang.label}
                  {currentLang === lang.code && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button 
                onClick={() => logger.userAction('Header', 'Opening notifications', undefined)}
                className="relative p-1.5 sm:p-2 rounded-md hover:bg-accent transition-colors"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-destructive rounded-full" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[min(90vw,320px)] sm:w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    You have no new notifications.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md hover:bg-accent transition-colors">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-fluid-xs font-semibold">{getUserInitials()}</span>
                </div>
                <div className="text-left hidden md:block min-w-0">
                  <div className="text-fluid-sm font-medium truncate">{getUserDisplayName()}</div>
                  <div className="text-fluid-xs text-muted-foreground truncate">{user?.email || 'User'}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(90vw,224px)] sm:w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                navigate('/settings');
                logger.userAction('Header', 'Opening profile', undefined);
              }}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigate('/settings');
                logger.userAction('Header', 'Opening settings', undefined);
              }}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
