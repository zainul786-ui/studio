'use client';

import { useFormStatus } from 'react-dom';
import { handleUserMessage } from '@/app/actions';
import { useEffect, useRef, useTransition, useActionState } from 'react';
import { SendHorizonal, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import type { ChatState, Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ZaidevLogo } from './icons';
import { Skeleton } from './ui/skeleton';

const initialMessages: Message[] = [
  {
    id: 'init',
    role: 'assistant',
    content: "Hello! I'm Zaidev AI. How can I help you today? You can ask me to break down a task or anything else!",
  },
];

const initialState: ChatState = {
  messages: initialMessages,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} aria-label="Send message">
      {pending ? <Skeleton className="h-5 w-5 rounded-full" /> : <SendHorizonal className="h-5 w-5" />}
    </Button>
  );
}

export default function ChatPanel() {
  const [state, formAction] = useActionState(handleUserMessage, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  useEffect(() => {
    if (scrollViewportRef.current) {
        setTimeout(() => {
            if (scrollViewportRef.current) {
                scrollViewportRef.current.scrollTo({
                  top: scrollViewportRef.current.scrollHeight,
                  behavior: 'smooth',
                });
            }
        }, 100);
    }
  }, [state.messages]);

  return (
    <Card className="w-full max-w-3xl mx-auto h-[75vh] flex flex-col">
      <ScrollArea className="flex-1 p-4" viewportRef={scrollViewportRef}>
        <div className="space-y-6">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback className="bg-primary/10">
                    <ZaidevLogo className="w-5 h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] p-3 rounded-lg text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p>{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isPending && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback className="bg-primary/10">
                    <ZaidevLogo className="w-5 h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] p-3 rounded-lg bg-muted">
                    <Skeleton className="h-4 w-10" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t shrink-0">
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(() => {
              formAction(formData);
            });
            formRef.current?.reset();
            textareaRef.current?.focus();
          }}
          className="flex items-center gap-2"
        >
          <Textarea
            ref={textareaRef}
            name="message"
            placeholder="Type your message..."
            className="flex-1 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          <SubmitButton />
        </form>
      </div>
    </Card>
  );
}
