import { Request, Response } from 'express';
import { createUrlMapping, getUrlMappingByCode } from '../services/urlService';
import { sendShortenedUrl } from '../services/socketService';

//Handle POST /url requests
export async function shortenUrl(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    const mapping = await createUrlMapping(url);
    const shortenedURL = `http://localhost:3000/${mapping.shortenedCode}`;

    //Send result via Socket.IO (NOT HTTP response)
    await sendShortenedUrl(req.headers['x-client-id'] as string || 'anonymous', shortenedURL);

    //Return success (without the shortened URL)
    res.status(200).json({ 
      message: 'Check your Socket.IO connection for the result',
      requestId: mapping.id
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

//Handle GET /:code requests
export async function redirectToOriginalUrl(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;
    const mapping = await getUrlMappingByCode(code);

    if (!mapping) {
      res.status(404).json({ error: 'URL not found' });
      return;
    }

    res.status(200).json({ url: mapping.originalUrl });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}