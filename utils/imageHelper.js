import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists (fallback check)
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Saves a base64 encoded image to the filesystem.
 * @param {string} base64DataUrl - The image as a base64 data URL.
 * @returns {Promise<string>} - The web URL of the saved image (e.g. '/uploads/uuid.png').
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
  const filePath = path.join(UPLOAD_DIR, filename);

  // Convert base64 to binary buffer and write
  const buffer = Buffer.from(base64Data, 'base64');
  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}

/**
 * Deletes an image from the filesystem.
 * @param {string} imageUrl - The web URL of the image (e.g. '/uploads/uuid.png').
 * @returns {Promise<boolean>} - True if deleted, false if the file did not exist.
 */
export async function deleteImage(imageUrl) {
  if (!imageUrl) return false;

  // Extract the filename from the URL path (e.g. /uploads/uuid.png -> uuid.png)
  const filename = path.basename(imageUrl);
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    // Check if the file exists and is in the uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    
    // Prevent directory traversal attacks
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      throw new Error('Directory traversal attempt detected');
    }

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
  } catch (error) {
    console.error(`Failed to delete image ${imageUrl}:`, error);
  }
  return false;
}
