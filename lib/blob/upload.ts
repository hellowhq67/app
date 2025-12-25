import { put, del } from '@vercel/blob';

/**
 * Upload an audio file to Vercel Blob storage
 * @param file - The audio file to upload
 * @param questionId - The ID of the question this audio is for
 * @returns The Blob URL of the uploaded file
 */
export async function uploadAudio(
    file: File,
    questionId: string
): Promise<string> {
    const filename = `audio/${questionId}/${Date.now()}-${file.name}`;

    const blob = await put(filename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
}

/**
 * Upload an image file to Vercel Blob storage
 * @param file - The image file to upload
 * @param questionId - The ID of the question this image is for
 * @returns The Blob URL of the uploaded file
 */
export async function uploadImage(
    file: File,
    questionId: string
): Promise<string> {
    const filename = `images/${questionId}/${Date.now()}-${file.name}`;

    const blob = await put(filename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
}

/**
 * Upload a user's audio response to Vercel Blob storage
 * @param file - The audio response file
 * @param userId - The ID of the user
 * @param attemptId - The ID of the attempt
 * @returns The Blob URL of the uploaded file
 */
export async function uploadUserResponse(
    file: File,
    userId: string,
    attemptId: string
): Promise<string> {
    const filename = `responses/${userId}/${attemptId}/${Date.now()}-${file.name}`;

    const blob = await put(filename, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
}

/**
 * Delete a file from Vercel Blob storage
 * @param url - The Blob URL to delete
 */
export async function deleteBlob(url: string): Promise<void> {
    await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
    });
}

/**
 * Upload multiple files to Vercel Blob storage
 * @param files - Array of files to upload
 * @param prefix - Path prefix for the files
 * @returns Array of Blob URLs
 */
export async function uploadMultipleFiles(
    files: File[],
    prefix: string
): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
        const filename = `${prefix}/${Date.now()}-${file.name}`;
        const blob = await put(filename, file, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        return blob.url;
    });

    return Promise.all(uploadPromises);
}
