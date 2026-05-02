import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAuthEmail } from '@/lib/auth-server';

const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCS = ['application/pdf'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOC_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string | null) ?? 'misc';

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

  const isImage = ALLOWED_IMAGES.includes(file.type);
  const isDoc = ALLOWED_DOCS.includes(file.type);
  if (!isImage && !isDoc) {
    return Response.json({ error: 'File type not allowed. Use JPG, PNG, WebP, GIF, or PDF.' }, { status: 400 });
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_DOC_BYTES;
  if (file.size > maxBytes) {
    return Response.json({ error: `File too large — max ${isImage ? 5 : 10}MB` }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return Response.json({ url: `/uploads/${folder}/${filename}` });
}
