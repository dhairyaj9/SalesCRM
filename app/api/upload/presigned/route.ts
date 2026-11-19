export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generatePresignedUploadUrl, isDangerousFileType } from '@/lib/s3';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { fileName, contentType, isPublic } = body || {};
  if (!fileName || typeof fileName !== 'string' || !fileName.trim()) {
    return NextResponse.json({ error: 'fileName required' }, { status: 400 });
  }

  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\') || fileName.includes('\0')) {
    return NextResponse.json({ error: 'Invalid fileName: path traversal characters not allowed' }, { status: 400 });
  }

  if (contentType !== undefined && typeof contentType !== 'string') {
    return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 });
  }

  if (isPublic !== undefined && typeof isPublic !== 'boolean') {
    return NextResponse.json({ error: 'Invalid isPublic' }, { status: 400 });
  }

  const resolvedContentType = contentType ?? 'application/octet-stream';
  const resolvedIsPublic = isPublic ?? false;

  if (isDangerousFileType(fileName, resolvedContentType)) {
    return NextResponse.json({ error: 'Disallowed file type or content type' }, { status: 400 });
  }

  try {
    const result = await generatePresignedUploadUrl(fileName.trim(), resolvedContentType, resolvedIsPublic);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to generate upload URL' }, { status: 400 });
  }
}
