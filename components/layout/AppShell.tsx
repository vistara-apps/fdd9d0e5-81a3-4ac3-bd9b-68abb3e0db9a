'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, Zap, ShoppingBag, BarChart3, Settings2, Home } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/Button';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: true },
    { name: 'Recommendations', href: '/recommendations', icon: Zap, current: false },
    { name: 'Products', href: '/products', icon: ShoppingBag, current: false },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, current: false },
    { name: 'Settings', href: '/settings', icon: Settings2, current: false },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface/90 backdrop-blur-sm border-r border-border transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">RetailRune</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-text-secondary hover:text-text-primary lg:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  item.current
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* User profile */}
          <div className="p-6 border-t border-border">
            <div className="flex items-center space-x-3">
              <UserAvatar size="medium" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  Store Manager
                </p>
                <p className="text-xs text-text-secondary truncate">
                  Connected via Base
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-t border-border">
          <nav className="flex items-center justify-around px-2 py-2" role="navigation" aria-label="Mobile navigation">
            {navigation.slice(0, 4).map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1',
                  item.current
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className={cn('lg:ml-64', isMobile && 'pb-20')}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-bg/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-text-secondary hover:text-text-primary lg:hidden transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Page title for mobile */}
              <h1 className="text-lg font-semibold text-text-primary lg:hidden">
                Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="primary" size="sm">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
