import { getSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * Saves a base64 encoded image to Supabase Storage.
 * @param {string} base64DataUrl - The image as a base64 data URL.
 * @returns {Promise<string>} - The public URL of the saved image.
 */
export async function saveImage(base64DataUrl) {
  if (!base64DataUrl) return null;

  // Match: data:image/png;base64,iVBORw0...
  const match = base64DataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image format. Must be a base64 data URL.');
  }

  const mimeType = match[1];
  const base64Data = match[2];
  
  // Extract extension from mimeType
  let extension = 'png'; // fallback
  const parts = mimeType.split('/');
  if (parts.length === 2) {
    // Map common image types
    const extMap = {
      'jpeg': 'jpg',
      'jpg': 'jpg',
      'png': 'png',
      'gif': 'gif',
      'webp': 'webp',
      'svg+xml': 'svg',
    };
    const mapped = extMap[parts[1]];
    if (mapped) {
      extension = mapped;
    } else {
      // sanitize and use whatever extension
      extension = parts[1].replace(/[^a-zA-Z0-9]/g, '');
    }
  }

  // Enforce size limit on the backend (e.g. 5MB)
  // Base64 is ~33% larger than binary, so length / 1.33 gives approximate size in bytes
  const approxSizeBytes = (base64Data.length * 3) / 4;
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  if (approxSizeBytes > MAX_SIZE_BYTES) {
    throw new Error('Image size exceeds 5MB limit.');
  }

  // Generate unique filename
  const filename = `${crypto.randomUUID()}.${extension}`;

  // Convert base64 to binary buffer and upload
  const buffer = Buffer.from(base64Data, 'base64');
  
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from('notice-images')
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error(`Failed to upload image to Supabase: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('notice-images')
    .getPublicUrl(filename);

  return publicUrl;
}

/**
 * Deletes an image from Supabase Storage.
 * @param {string} imageUrl - The public URL of the image.
 * @returns {Promise<boolean>} - True if deleted successfully.
 */
export async function deleteImage(imageUrl) {
  if (!imageUrl) return false;

  // Extract the filename from the URL path (e.g. https://.../notice-images/filename.png -> filename.png)
  const filename = imageUrl.split('/').pop();
  if (!filename) return false;

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from('notice-images')
      .remove([filename]);

    if (error) {
      console.error(`Failed to delete image ${imageUrl} from Supabase Storage:`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete image ${imageUrl}:`, error);
    return false;
  }
}
