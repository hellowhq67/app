import { put } from '@vercel/blob';

export async function uploadAudio(file: File | Blob, fileName: string) {
    try {
        const blob = await put(`recordings/${fileName}`, file, {
            access: 'public',
        });
        return blob.url;
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        throw error;
    }
}
