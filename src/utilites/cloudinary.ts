// utils/cloudinary.ts
import streamifier from 'streamifier';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse, TransformationOptions } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true
});

// Define a more specific type for our transformations
interface TransformationPreset {
  quality?: string | number;
  fetch_format?: string;
  width?: number | string;
  height?: number | string;
  crop?: string;
  gravity?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: TransformationPreset | TransformationPreset[];
  width?: number;
  height?: number;
  crop?: string;
  quality?: string | number;
  format?: string;
  gravity?: string;
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
        folder: options.folder || 'products',
        public_id: options.public_id,
        transformation: options.transformation as TransformationOptions,
        width: options.width,
        height: options.height,
        crop: options.crop,
        quality: options.quality,
        format: options.format,
        gravity: options.gravity,
        ...options
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(new Error(error.message));
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed: No response from Cloudinary'));
        }
      }
    );
    
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Helper function for image optimization options
export const getOptimizedTransformation = (width?: number, height?: number): TransformationPreset[] => {
  const transformation: TransformationPreset[] = [
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ];
  
  if (width || height) {
    transformation.push({
      width: width || 'auto',
      height: height || 'auto',
      crop: 'limit'
    });
  }
  
  return transformation;
};

// Helper function for avatar transformations
export const getAvatarTransformation = (size: number = 200): TransformationPreset[] => [
  { width: size, height: size, crop: 'fill', gravity: 'face' },
  { quality: 'auto:good' },
  { fetch_format: 'auto' }
];

// Helper function for product image transformations
export const getProductTransformation = (width: number = 1200, height: number = 800): TransformationPreset[] => [
  { width, height, crop: 'limit' },
  { quality: 'auto:good' },
  { fetch_format: 'auto' }
];

// Helper function to combine transformations
export const combineTransformations = (...transformations: TransformationPreset[][]): TransformationPreset[] => {
  return transformations.flat();
};

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

// Helper function to get optimized URL
export const getOptimizedUrl = (publicId: string, options?: TransformationPreset | TransformationPreset[]): string => {
  return cloudinary.url(publicId, {
    transformation: options as TransformationOptions,
    secure: true
  });
};