import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: string, folder: string) {
  const result = await cloudinary.uploader.upload(file, { folder: `artist-connect/${folder}` });
  return { url: result.secure_url, thumbnail: result.secure_url.replace('/upload/', '/upload/w_400/') };
}

export async function deleteFromCloudinary(url: string) {
  const publicId = url.split('/').pop()?.split('.')[0];
  if (publicId) await cloudinary.uploader.destroy(`artist-connect/${publicId}`);
}

export { cloudinary };
