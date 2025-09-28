'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

const ImageEditor = dynamic(() => import('@/components/image-editor'), {
  ssr: false,
  loading: () => <Skeleton className="w-full max-w-4xl mx-auto h-[500px]" />,
});

export default function ClientOnlyImageEditor() {
  return <ImageEditor />;
}
