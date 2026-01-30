import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { fileName, fileBase64, projectSlug } = req.body;

    const token = process.env.GITHUB_IMAGES_TOKEN;
    const OWNER = 'YOUR_GITHUB_USERNAME';
    const REPO = 'portfolio-images';

    if (!token) {
      return res.status(500).json({ error: 'Missing GitHub token' });
    }

    const path = `projects/${projectSlug}/${fileName}`;

    const githubRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Upload ${fileName}`,
          content: fileBase64
        })
      }
    );

    const data = await githubRes.json();

    if (!githubRes.ok) {
      return res.status(500).json({ error: data.message });
    }

    res.status(200).json({
      url: data.content.download_url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
}
