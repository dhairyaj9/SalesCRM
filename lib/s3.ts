import path from 'path';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const DANGEROUS_EXTENSIONS = new Set([
  '.html', '.htm', '.xhtml', '.svg', '.xml', '.xsl', '.xslt',
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx',
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.bash', '.com', '.scr', '.vbs', '.ps1',
  '.jsp', '.asp', '.aspx', '.cgi', '.pl',
]);

const DANGEROUS_MIME_TYPES = new Set([
  'text/html',
  'application/xhtml+xml',
  'image/svg+xml',
  'text/javascript',
  'application/javascript',
  'application/x-javascript',
  'text/ecmascript',
  'application/ecmascript',
  'text/xml',
  'application/xml',
  'application/xslt+xml',
  'text/vbscript',
  'application/x-sh',
  'application/x-csh',
  'application/x-bat',
  'application/x-msdownload',
  'application/x-executable',
  'application/x-httpd-php',
  'text/x-php',
]);

export function isDangerousFileType(fileName: string, contentType: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return true;
  }
  const mime = contentType.toLowerCase().split(';')[0].trim();
  if (DANGEROUS_MIME_TYPES.has(mime)) {
    return true;
  }
  if (
    mime.startsWith('text/html') ||
    mime.startsWith('application/xhtml') ||
    mime.startsWith('text/javascript') ||
    mime.startsWith('application/javascript') ||
    mime.startsWith('application/x-javascript') ||
    mime.startsWith('text/ecmascript') ||
    mime.startsWith('application/ecmascript') ||
    mime.startsWith('text/vbscript') ||
    mime.startsWith('application/xslt+xml') ||
    mime.startsWith('application/x-httpd-php') ||
    mime.startsWith('text/x-php') ||
    mime.startsWith('application/x-sh') ||
    mime.startsWith('application/x-csh') ||
    mime.startsWith('application/x-bat') ||
    mime.startsWith('application/x-msdownload') ||
    mime.startsWith('application/x-executable') ||
    mime.includes('javascript') ||
    mime.includes('ecmascript') ||
    mime.includes('script') ||
    mime.endsWith('+xml')
  ) {
    return true;
  }
  return false;
}

export function sanitizeFileName(fileName: string): string {
  const baseName = path.basename(fileName.replace(/\\/g, '/'));
  const cleaned = baseName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
  return cleaned || 'file';
}

function shouldServeInline(contentType: string): boolean {
  return (contentType.startsWith('image/') && contentType !== 'image/svg+xml')
    || contentType.startsWith('video/')
    || contentType.startsWith('audio/');
}

export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = false) {
  if (isDangerousFileType(fileName, contentType)) {
    throw new Error('Disallowed file type or content type');
  }
  const s3 = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  const safeFileName = sanitizeFileName(fileName);
  const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${safeFileName}`;
  const command = new PutObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return { uploadUrl, cloud_storage_path };
}

export async function getFileUrl(cloudStoragePath: string, contentType: string, isPublic: boolean) {
  const s3 = createS3Client();
  const { bucketName } = getBucketConfig();
  if (isPublic) {
    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloudStoragePath.split('/').map(encodeURIComponent).join('/')}`;
  }
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cloudStoragePath,
    ResponseContentDisposition: shouldServeInline(contentType) ? 'inline' : 'attachment',
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteFile(cloudStoragePath: string) {
  const s3 = createS3Client();
  const { bucketName } = getBucketConfig();
  await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloudStoragePath }));
}

export async function initiateMultipartUpload(fileName: string, contentType: string, isPublic: boolean) {
  if (isDangerousFileType(fileName, contentType)) {
    throw new Error('Disallowed file type or content type');
  }
  const s3 = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  const safeFileName = sanitizeFileName(fileName);
  const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${safeFileName}`;
  const command = new CreateMultipartUploadCommand({ Bucket: bucketName, Key: cloud_storage_path, ContentType: contentType });
  const result = await s3.send(command);
  return { uploadId: result.UploadId, cloud_storage_path };
}

export async function getPresignedUrlForPart(cloudStoragePath: string, uploadId: string, partNumber: number) {
  const s3 = createS3Client();
  const { bucketName } = getBucketConfig();
  const command = new UploadPartCommand({ Bucket: bucketName, Key: cloudStoragePath, UploadId: uploadId, PartNumber: partNumber });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function completeMultipartUpload(cloudStoragePath: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
  const s3 = createS3Client();
  const { bucketName } = getBucketConfig();
  const command = new CompleteMultipartUploadCommand({ Bucket: bucketName, Key: cloudStoragePath, UploadId: uploadId, MultipartUpload: { Parts: parts } });
  await s3.send(command);
}
