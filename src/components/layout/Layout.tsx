import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GradientCanvas } from './GradientCanvas';
import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logger from '@/lib/logger';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    logger.componentMount('Layout');
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    logger.stateChange('Layout', 'sidebarCollapsed', !sidebarCollapsed, sidebarCollapsed);
    logger.info('UI', `Sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`, {
      collapsed: sidebarCollapsed
    }, 'Layout', 'SIDEBAR_TOGGLE');
  }, [sidebarCollapsed]);

  return (
    <div className="relative flex h-screen min-h-0 w-full max-w-[100vw] overflow-hidden bg-[#f4f6f8]">
      <GradientCanvas />
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      {/* Backdrop when mobile menu open */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`
          relative z-10 flex flex-1 flex-col min-w-0 overflow-hidden
          transition-[margin-left] duration-200 ease-out
          ml-0
          lg:ml-[var(--sidebar-w-collapsed)]
          ${!sidebarCollapsed ? 'lg:!ml-[var(--sidebar-w)]' : ''}
        `}
      >
        <Header onMenuClick={() => setMobileMenuOpen((o) => !o)} />
        <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="main-scroll-area flex-1 overflow-y-auto overflow-x-hidden content-pad overscroll-contain bg-transparent">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
