
'use client';

import { ZaidevLogo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('user'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <ZaidevLogo className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Zaidev AI</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoggedIn && (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
