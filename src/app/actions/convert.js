"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import ConvertApi from 'convertapi';
import { randomUUID } from 'crypto';
import path from 'path';
import fetch from 'node-fetch';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const convertapi = new ConvertApi(process.env.CONVERT_API_KEY);

export default async function convertAndUpload(file, sampleUrl) {
  try {
    const extension = path.extname(file.name).toLowerCase();
    const fileBuffer = await file.arrayBuffer();
    const fileBody = Buffer.from(fileBuffer);

    // Step 1: Upload original file to S3 to get a public URL
    const originalParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploaded/${randomUUID()}_${file.name}`,
      Body: fileBody,
      ContentType: file.type,
    };
    await s3.send(new PutObjectCommand(originalParams));
    const uploadedFileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${originalParams.Key}`;

    // Step 2: Convert uploaded file to .txt format if not already
    const txtResult = await convertapi.convert('txt', { File: uploadedFileUrl }, extension.substring(1));
    const txtFileUrl = txtResult.files[0].url;

    // Step 3: Upload the .txt file to S3
    const txtResponse = await fetch(txtFileUrl);
    const txtBuffer = await txtResponse.buffer();
    const txtParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `converted/${randomUUID()}_${file.name.replace(extension, '.txt')}`,
      Body: txtBuffer,
      ContentType: 'text/plain',
    };
    await s3.send(new PutObjectCommand(txtParams));
    const txtUploadedUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${txtParams.Key}`;

    // Step 4: Convert uploaded document to image (e.g., .png) for preview
    const pngResult = await convertapi.convert('png', { File: uploadedFileUrl, ImageResolution: '300' }, extension.substring(1));
    const pngFileUrl = pngResult.files[0].url;
    const pngResponse = await fetch(pngFileUrl);
    const pngBuffer = await pngResponse.buffer();
    const pngParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `converted/${randomUUID()}_${file.name.replace(extension, '.png')}`,
      Body: pngBuffer,
      ContentType: 'image/png',
    };
    await s3.send(new PutObjectCommand(pngParams));
    const convertedPreviewUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pngParams.Key}`;

    // Step 5: Convert sample document URL to .txt format
    const sampleTxtResult = await convertapi.convert('txt', { File: sampleUrl }, 'docx');
    const sampleTxtFileUrl = sampleTxtResult.files[0].url;
    const sampleTxtResponse = await fetch(sampleTxtFileUrl);
    const sampleTxtBuffer = await sampleTxtResponse.buffer();
    const sampleTxtParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `converted/${randomUUID()}_sample.txt`,
      Body: sampleTxtBuffer,
      ContentType: 'text/plain',
    };
    await s3.send(new PutObjectCommand(sampleTxtParams));
    const sampleTxtUploadedUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${sampleTxtParams.Key}`;

    return {
      message: 'File converted to .txt and .png, and uploaded successfully',
      convertedPreviewUrl,
      convertedFileUrl: txtUploadedUrl,
      sampleConvertedFileUrl: sampleTxtUploadedUrl
    };
  } catch (error) {
    console.error('Conversion or Upload error:', error);
    throw new Error('Error during conversion or upload');
  }
}
