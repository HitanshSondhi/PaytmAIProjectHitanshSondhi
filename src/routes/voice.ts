import { Request, Response, Router } from "express";
import { routeIntent } from "../intentRouter";
import { extractIntent } from "../nlp";

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { transcript, lang } = req.body as { transcript: string; lang: string };
  try {
    if (!transcript?.trim())
      return res.status(400).json({ error: 'Empty transcript' });
    const { intent, entities } = await extractIntent(transcript.toLowerCase().trim());
    const result = await routeIntent(intent, entities, 1, lang);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ intent, entities, ...result });
  } catch (e) {
    console.error('[Voice Route]', e);
    res.status(500).json({
      responseText: lang === 'en-IN' ? 'Server error. Please try again.' : 'Server error. Dobara try karein.',
      responseType: 'unknown', responseData: {}, orbState: 'success',
    });
  }
});

export default router;
