import { ZaidevLogo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from './ui/button';
import Link from 'next/link';

export function Header() {
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
