'use client';

import * as React from 'react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleUserMessage, convertTextToSpeech } from '@/app/actions';
import {
  Clipboard,
  Copy,
  SendHorizonal,
  ThumbsDown,
  ThumbsUp,
  User,
  Volume2,
  Loader,
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

const initialMessages: Message[] = [
  {
    id: 'init',
    role: 'assistant',
    content:
      "Hello! I'm Zaidev AI. Ask me a coding question.",
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
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: 'The code has been copied to your clipboard.',
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-950 rounded-md mt-4 relative">
       <pre className="text-sm text-white p-4 overflow-x-auto whitespace-pre">
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

function AssistantMessageActions({ message }: { message: Message }) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopy = () => {
    const textToCopy = message.code
      ? `${message.content}\n\n\`\`\`\n${message.code}\n\`\`\``
      : message.content;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    toast({ title: 'Thank you for your feedback!' });
  };

  const handleReadAloud = async () => {
    if (isSpeaking) {
      audioRef.current?.pause();
      audioRef.current?.remove();
      audioRef.current = null;
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    const result = await convertTextToSpeech(message.content);
    if ('audioDataUri' in result) {
      const audio = new Audio(result.audioDataUri);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
    } else {
      toast({
        variant: 'destructive',
        title: 'Could not read message aloud',
        description: result.error,
      });
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', feedback === 'like' && 'text-blue-500')}
        onClick={() => handleFeedback('like')}
        aria-label="Like"
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', feedback === 'dislike' && 'text-red-500')}
        onClick={() => handleFeedback('dislike')}
        aria-label="Dislike"
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
        aria-label="Copy"
      >
        {isCopied ? (
          <Clipboard className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleReadAloud}
        aria-label="Read aloud"
        disabled={isSpeaking}
      >
        {isSpeaking ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Volume2 className="w-4 h-4" />
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
  const scrollViewportRef = useRef<HTMLDivElement>(null);

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

  const handleFormAction = (formData: FormData) => {
    formAction(formData);
    formRef.current?.reset();
    textareaRef.current?.focus();
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
                className={cn('max-w-[85%]',
                  message.role === 'user' ? '' : 'group'
                )}
              >
                <div
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.code && <CodeBlock code={message.code} />}
                </div>
                {message.role === 'assistant' && (
                  <AssistantMessageActions message={message} />
                )}
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
          action={handleFormAction}
          className="flex items-center gap-2"
        >
          <Textarea
            ref={textareaRef}
            name="message"
            placeholder="Ask a question..."
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
        </form>
      </div>
    </Card>
  );
}
