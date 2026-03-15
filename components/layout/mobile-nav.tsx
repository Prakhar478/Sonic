'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/library', label: 'Library', icon: Library },
];

export function MobileNav() {
  const pathname = usePathname();
  const isMobile = useUIStore((s) => s.isMobile);

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-[var(--player-height,0px)] left-0 right-0 z-40 glass-heavy border-t border-[var(--border)]">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-default',
                isActive
                  ? 'text-primary-400'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              <tab.icon className={cn('w-5 h-5', isActive && 'text-primary-400')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
