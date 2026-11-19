import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

function shouldServeInline(contentType: string): boolean {
  return (contentType.startsWith('image/') && contentType !== 'image/svg+xml')
    || contentType.startsWith('video/')
    || contentType.startsWith('audio/');
}

export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = false) {
  const s3 = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({ Bucket: bucketName, Key: cloud_storage_path });
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
  const s3 = createS3Client();
  const { bucketName, folderPrefix } = getBucketConfig();
  const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;
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
