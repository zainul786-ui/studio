'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import ChatPanel from '@/components/chat-panel';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 w-full overflow-hidden">
        <div className="container mx-auto h-full py-4 md:py-8">
          {isClient ? (
            <ChatPanel />
          ) : (
            <Card className="w-full max-w-3xl mx-auto h-full flex flex-col">
              <div className="flex-1 p-4">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="p-4 border-t shrink-0">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
