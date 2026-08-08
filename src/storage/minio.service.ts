// minio.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MinioService {
  private readonly client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT!, // https://storage.integran.mx
    region: 'us-east-1', // MinIO lo ignora pero el SDK lo requiere
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_SECRET_KEY!,
    },
    forcePathStyle: true, // CLAVE para MinIO, si no, intenta usar virtual-hosted style y falla
  });

  async uploadFile(bucket: string, key: string, buffer: Buffer, mimetype: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );
    return `${process.env.MINIO_PUBLIC_URL}/${bucket}/${key}`;
  }

  async getSignedDownloadUrl(bucket: string, key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}