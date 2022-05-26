/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AbortController } from "@aws-sdk/abort-controller";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs-extra";

const requiredEnvVariables = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_BUCKET",
  "AWS_REGION",
];

const missingEnvVariables = requiredEnvVariables.filter(
  (el) => !process.env[el]
);

if (missingEnvVariables.length)
  throw new Error(
    `Missing required environment variables : ${missingEnvVariables.join(", ")}`
  );

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const uploadBucketFile = (
  { path }: Express.Multer.File,
  key: string,
  abortController?: AbortController
) =>
  s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: fs.createReadStream(path),
    }),
    {
      abortSignal: abortController?.signal,
    }
  );

export const batchUploadFiles = (
  files: { file: Express.Multer.File; key: string }[],
  abortController?: AbortController
) =>
  Promise.all(
    files.map(({ file, key }) => uploadBucketFile(file, key, abortController))
  );

export const getBucketFileStream = async (
  key: string,
  abortController?: AbortController
) =>
  (
    await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      }),
      { abortSignal: abortController?.signal }
    )
  ).Body as fs.ReadStream;

export const deleteBucketFile = (
  key: string,
  abortController?: AbortController
) =>
  s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    }),
    {
      abortSignal: abortController?.signal,
    }
  );

export default s3Client;