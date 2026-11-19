export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generatePresignedUploadUrl } from '@/lib/s3';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { fileName, contentType, isPublic } = await req.json();
  if (!fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 });
  const result = await generatePresignedUploadUrl(fileName, contentType ?? 'application/octet-stream', isPublic ?? false);
  return NextResponse.json(result);
}
