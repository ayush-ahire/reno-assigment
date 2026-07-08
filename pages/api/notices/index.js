import prisma from '@/lib/prisma';
import { validateNotice } from '@/utils/validation';
import { saveImage } from '@/utils/imageHelper';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Fetch notices: Urgent first (descending priority alphabetical order: 'Urgent' > 'Normal'),
      // then newest publish date first.
      const notices = await prisma.notice.findMany({
        orderBy: [
          { priority: 'desc' },
          { publishDate: 'desc' },
        ],
      });
      return res.status(200).json(notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      return res.status(500).json({ error: 'Failed to fetch notices' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, body, category, priority, publishDate, image } = req.body;

      // Server-side validation
      const { isValid, errors } = validateNotice({ title, body, category, priority, publishDate });
      if (!isValid) {
        return res.status(400).json({ errors });
      }

      // Handle optional image upload
      let imageUrl = null;
      if (image) {
        try {
          imageUrl = await saveImage(image);
        } catch (imgErr) {
          return res.status(400).json({ errors: { image: imgErr.message } });
        }
      }

      // Create notice in DB
      const notice = await prisma.notice.create({
        data: {
          title: title.trim(),
          body: body.trim(),
          category,
          priority,
          publishDate: new Date(publishDate),
          imageUrl,
        },
      });

      return res.status(201).json(notice);
    } catch (error) {
      console.error('Error creating notice:', error);
      return res.status(500).json({ error: 'Failed to create notice' });
    }
  }

  // Handle unsupported HTTP methods
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

