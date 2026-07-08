import prisma from '@/lib/prisma';
import { validateNotice } from '@/utils/validation';
import { saveImage, deleteImage } from '@/utils/imageHelper';

export default async function handler(req, res) {
  const { id } = req.query;

  // Verify that ID is provided
  if (!id) {
    return res.status(400).json({ error: 'Missing notice ID' });
  }

  // 1. GET - Retrieve a single notice
  if (req.method === 'GET') {
    try {
      const notice = await prisma.notice.findUnique({
        where: { id },
      });

      if (!notice) {
        return res.status(404).json({ error: 'Notice not found' });
      }

      return res.status(200).json(notice);
    } catch (error) {
      console.error(`Error fetching notice ${id}:`, error);
      return res.status(500).json({ error: 'Failed to fetch notice' });
    }
  }

  // 2. PUT - Update a notice
  if (req.method === 'PUT') {
    try {
      const { title, body, category, priority, publishDate, image, removeImage } = req.body;

      // Verify existence first
      const existingNotice = await prisma.notice.findUnique({
        where: { id },
      });

      if (!existingNotice) {
        return res.status(404).json({ error: 'Notice not found' });
      }

      // Server-side validation
      const { isValid, errors } = validateNotice({ title, body, category, priority, publishDate });
      if (!isValid) {
        return res.status(400).json({ errors });
      }

      let imageUrl = existingNotice.imageUrl;

      if (removeImage) {
        if (existingNotice.imageUrl) {
          await deleteImage(existingNotice.imageUrl);
        }
        imageUrl = null;
      } else if (image) {
        try {
          const newImageUrl = await saveImage(image);
          if (existingNotice.imageUrl) {
            await deleteImage(existingNotice.imageUrl);
          }
          imageUrl = newImageUrl;
        } catch (imgErr) {
          return res.status(400).json({ errors: { image: imgErr.message } });
        }
      }

      // Update notice in DB
      const updatedNotice = await prisma.notice.update({
        where: { id },
        data: {
          title: title.trim(),
          body: body.trim(),
          category,
          priority,
          publishDate: new Date(publishDate),
          imageUrl,
        },
      });

      return res.status(200).json(updatedNotice);
    } catch (error) {
      console.error(`Error updating notice ${id}:`, error);
      return res.status(500).json({ error: 'Failed to update notice' });
    }
  }

  // 3. DELETE - Delete a notice
  if (req.method === 'DELETE') {
    try {
      // Verify existence first
      const existingNotice = await prisma.notice.findUnique({
        where: { id },
      });

      if (!existingNotice) {
        return res.status(404).json({ error: 'Notice not found' });
      }

      // Cleanup local image if any exists
      if (existingNotice.imageUrl) {
        await deleteImage(existingNotice.imageUrl);
      }

      await prisma.notice.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Notice deleted successfully' });
    } catch (error) {
      console.error(`Error deleting notice ${id}:`, error);
      return res.status(500).json({ error: 'Failed to delete notice' });
    }
  }

  // Handle unsupported HTTP methods
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

