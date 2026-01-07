export async function uploadAudioWithFallback(file: File): Promise<string> {
    console.log('Mock uploading audio:', file.name)
    // Simulate upload
    return URL.createObjectURL(file)
}
