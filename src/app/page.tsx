import { Header } from '@/components/header';
import ClientOnlyChatPanel from '@/components/client-only-chat-panel';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 w-full overflow-hidden">
        <div className="container mx-auto h-full py-4 md:py-8">
          <ClientOnlyChatPanel />
        </div>
      </main>
    </div>
  );
}
