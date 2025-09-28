import { Header } from '@/components/header';
import ClientOnlyChatPanel from '@/components/client-only-chat-panel';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto py-4 md:py-8 h-[calc(100vh-8rem)]">
          <ClientOnlyChatPanel />
        </div>
      </main>
    </div>
  );
}
