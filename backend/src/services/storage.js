import { storage } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../utils/errors.js';

export async function uploadFile(buffer, originalName, mimeType, folder = 'resumes') {
  const ext = originalName.split('.').pop();
  const filename = `${folder}/${uuidv4()}.${ext}`;
  const file = storage.file(filename);

  const stream = file.createWriteStream({
    metadata: { contentType: mimeType, metadata: { originalName } },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => reject(new BadRequestError('Upload failed')));
    stream.on('finish', async () => {
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${storage.name}/${filename}`;
      resolve({ filename, url: publicUrl, size: buffer.length });
    });
    stream.end(buffer);
  });
}

export async function deleteFile(url) {
  if (!url) return;
  try {
    const path = decodeURIComponent(url.split('/o/')[1]?.split('?')[0] || '');
    if (path) await storage.file(path).delete();
  } catch {
    // File may not exist
  }
}
