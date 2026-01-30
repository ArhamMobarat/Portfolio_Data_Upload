import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

import dotenv from 'dotenv';
dotenv.config();
  console.log('Token exists:', !!process.env.GITHUB_IMAGES_TOKEN);
  
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/upload-image', async (req, res) => {
  try {
    const { fileName, fileBase64, projectSlug } = req.body;
    // dotenv.config();
    const token = process.env.GITHUB_IMAGES_TOKEN;
    const OWNER = 'ArhamMobarat';
    const REPO = 'portfolio-images';

    const path = `projects/${projectSlug}/${fileName}`;

    const githubRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload ${fileName}`,
          content: fileBase64,
        }),
      }
    );

    const data = await githubRes.json();

    if (!githubRes.ok) {
      return res.status(500).json({ error: data.message });
    }

    res.json({ url: data.content.download_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(4000, () => {
  console.log('API server running on http://localhost:4000');

});
