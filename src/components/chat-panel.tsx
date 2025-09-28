'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { handleUserMessage } from '@/app/actions';
import {
  Clipboard,
  Copy,
  PlusCircle,
  SendHorizonal,
  User,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ZaidevLogo } from './icons';
import { useToast } from '@/hooks/use-toast';
import type { ChatState, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Input } from './ui/input';

const initialMessages: Message[] = [
  {
    id: 'init',
    role: 'assistant',
    content:
      "Hello! I'm Zaidev AI, your expert coding and image editing assistant. How can I help you today?",
  },
];

const initialState: ChatState = {
  messages: initialMessages,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      disabled={pending}
      aria-label="Send message"
    >
      {pending ? (
        <Skeleton className="h-5 w-5 rounded-full" />
      ) : (
        <SendHorizonal className="h-5 w-5" />
      )}
    </Button>
  );
}

function CodeBlock({ code }: { code: string }) {
  const { toast } = useToast();
  const [isCopied, startTransition] = useTransition();

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      startTransition(() => {
        toast({
          title: 'Copied to clipboard!',
          description: 'The code has been copied to your clipboard.',
        });
      });
    });
  };

  return (
    <div className="bg-gray-950 rounded-md mt-4 relative">
      <pre className="text-sm text-white p-4 overflow-x-auto whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8 text-white hover:text-white hover:bg-gray-800"
        onClick={handleCopy}
        disabled={isCopied}
      >
        {isCopied ? (
          <Clipboard className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export default function ChatPanel() {
  const [state, formAction, isPending] = useActionState(
    handleUserMessage,
    initialState
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto h-full flex flex-col">
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
                  'max-w-[85%] p-3 rounded-lg text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.imageUrl && (
                    <Image
                      src={message.imageUrl}
                      alt="User uploaded image"
                      width={300}
                      height={200}
                      className="rounded-md object-cover mb-2"
                    />
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.code && <CodeBlock code={message.code} />}
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
            if (imagePreview) {
              formData.set('imageDataUri', imagePreview);
            }
            formAction(formData);
            clearImagePreview();
            formRef.current?.reset();
            textareaRef.current?.focus();
          }}
          className="flex flex-col gap-2"
        >
          {imagePreview && (
            <div className="relative w-24 h-24 mb-2">
              <Image
                src={imagePreview}
                alt="Image preview"
                fill
                className="rounded-md object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-600 hover:bg-slate-700 text-white"
                onClick={clearImagePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              name="imageFile"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Textarea
              ref={textareaRef}
              name="message"
              placeholder="Ask a coding question or edit an image..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              required
            />
            <SubmitButton />
          </div>
        </form>
      </div>
    </Card>
  );
}
