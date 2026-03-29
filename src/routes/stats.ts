import { Request, Response, Router } from "express";
import { KEYS, getCache, setCache } from "../cache";
import { getDashboardStats } from "../queries";

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const cacheKey = KEYS.stats(1);
    let data = await getCache(cacheKey);
    if (!data) {
      data = await getDashboardStats(1);
      await setCache(cacheKey, data, 60);
    }
    res.json(data);
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;
