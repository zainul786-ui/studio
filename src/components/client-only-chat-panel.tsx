"use client";

import { useEffect, useState } from "react";
import ChatPanel from "./chat-panel";
import { Skeleton } from "./ui/skeleton";
import { Card } from "./ui/card";

export default function ClientOnlyChatPanel() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className="w-full max-w-3xl mx-auto h-full flex flex-col">
        <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
        </div>
        <div className="p-4 border-t shrink-0">
            <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    )
  }

  return <ChatPanel />;
}
