import { Request, Response, Router } from "express";
import { KEYS, getCache, setCache } from "../cache";
import { getCustomerScore } from "../queries";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.query.customerId as string);
    if (!customerId) return res.status(400).json({ error: 'customerId required' });
    const cacheKey = KEYS.score(customerId);
    let data = await getCache(cacheKey);
    if (!data) {
      data = await getCustomerScore(customerId);
      await setCache(cacheKey, data, 120);
    }
    res.json({ customerId, ...data as object });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;
