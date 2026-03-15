'use client';

import { useEffect, useState } from 'react';

/**
 * Theme provider — Forces 'dark' class on <html> permanently.
 * Removes any toggle logic and hydration mismatch.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force dark mode always
    document.documentElement.classList.add('dark');
  }, []);

  // Simple script to inject dark class immediately on head
  if (!mounted) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark');`,
          }}
        />
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </>
    );
  }

  return <>{children}</>;
}
