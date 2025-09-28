'use client';

import { useFormStatus } from 'react-dom';
import { handleImageEdit, type ImageEditState } from '@/app/actions';
import { useEffect, useState, useRef, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Label } from './ui/label';
import { Sparkles, Upload } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

const defaultImage = PlaceHolderImages.find(p => p.id === 'image-editor-default');

const quickPrompts = [
    "Make this black and white",
    "Increase the brightness",
    "Make it look like a vintage photograph",
    "Convert to a watercolor painting",
    "Add a dramatic, cinematic look",
    "Change the background to a forest",
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {pending ? 'Generating...' : 'Generate Edit'}
        </Button>
    );
}

const initialState: ImageEditState = {
    editedImageDataUri: undefined,
    error: undefined,
};

export default function ImageEditor() {
    const [state, formAction] = useActionState(handleImageEdit, initialState);
    const { toast } = useToast();
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // This ensures the image is only set on the client-side, avoiding SSR mismatches.
        setOriginalImage(defaultImage?.imageUrl || '');
    }, []);

    useEffect(() => {
        if (state.error) {
            toast({
                variant: 'destructive',
                title: 'An error occurred',
                description: state.error,
            });
        }
    }, [state.error, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const result = loadEvent.target?.result as string;
                setOriginalImage(result);
                // Also update the edited image to reflect the new original
                state.editedImageDataUri = undefined; 
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>AI Image Editor</CardTitle>
                <CardDescription>Upload an image and describe the changes you want to make.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="imageDataUri" value={originalImage || ''} />
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-4">
                            <Card>
                                <CardContent className="p-2">
                                    <div className="aspect-video relative w-full">
                                        {originalImage ? (
                                            <Image
                                                src={originalImage}
                                                alt="Original image"
                                                fill
                                                className="rounded-md object-cover"
                                                data-ai-hint="abstract art"
                                            />
                                        ) : (
                                            <Skeleton className="w-full h-full" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload New Image
                            </Button>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="space-y-4">
                             <Card>
                                <CardContent className="p-2">
                                    <div className="aspect-video relative w-full bg-muted rounded-md">
                                        {state.editedImageDataUri ? (
                                            <Image
                                                src={state.editedImageDataUri}
                                                alt="Edited image"
                                                fill
                                                className="rounded-md object-cover"
                                            />
                                        ) : (
                                          <div className="flex items-center justify-center h-full text-muted-foreground">
                                              <p>Your edited image will appear here</p>
                                          </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                             <p className="text-sm text-center text-muted-foreground">AI Generated Result</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Your Editing Prompt</Label>
                        <Input
                            id="prompt"
                            name="prompt"
                            placeholder="e.g., 'Make the sky purple'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Quick Edits</Label>
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((p) => (
                                <Button key={p} type="button" variant="secondary" size="sm" onClick={() => setPrompt(p)}>
                                    {p}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
