import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'pet-images');

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    filename: (name, ext, part, form) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      return `pet-${timestamp}-${randomStr}${ext}`;
    },
  });

  try {
    // Use promise-based parsing
    const parseForm = () => new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = await parseForm();
    const file = files.image?.[0] || files.image;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the public URL path
    const publicPath = `/pet-images/${path.basename(file.filepath || file.path)}`;

    return res.status(200).json({
      success: true,
      path: publicPath,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Error uploading file', details: error.message });
  }
}

