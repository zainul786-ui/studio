import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Image as ImageIconLucide } from 'lucide-react';
import { Header } from '@/components/header';
import ChatPanel from '@/components/chat-panel';
import ClientOnlyImageEditor from '@/components/client-only-image-editor';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto py-4 md:py-8">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-auto md:w-[400px]">
              <TabsTrigger value="chat">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="image-editor">
                <ImageIconLucide className="mr-2 h-4 w-4" />
                Image Editor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="mt-6">
              <ChatPanel />
            </TabsContent>
            <TabsContent value="image-editor" className="mt-6">
              <ClientOnlyImageEditor />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
