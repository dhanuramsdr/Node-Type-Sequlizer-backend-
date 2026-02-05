// utils/cloudinary.ts
import streamifier from 'streamifier';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true
});

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: any[];
}

// High-performance stream upload
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<UploadApiResponse> => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Invalid file buffer');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
        ...options
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) reject(new Error(error.message));
        else if (result) resolve(result);
        else reject(new Error('Upload failed'));
      }
    );
    
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};