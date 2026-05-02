const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const MAX_IMAGE_MB = 5;
const MAX_DOC_MB = 10;

export function validateFile(file: File, type: 'image' | 'document') {
  const allowed = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES;
  const maxMB = type === 'image' ? MAX_IMAGE_MB : MAX_DOC_MB;
  if (!allowed.includes(file.type)) {
    throw new Error(type === 'image' ? 'Only JPG, PNG, WebP or GIF allowed' : 'Only PDF allowed');
  }
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(`File too large — max ${maxMB}MB`);
  }
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const r = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'Upload failed');
  }
  const { url } = await r.json();
  return url as string;
}

export function generatePath(folder: string, _filename: string): string {
  return folder;
}
