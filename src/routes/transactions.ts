import { Request, Response, Router } from "express";
import { KEYS, invalidateCache } from "../cache";
import { addScoreEvent, addTransaction } from "../queries";

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, amount, method } = req.body;
    if (!customerId || !amount || amount <= 0)
      return res.status(400).json({ error: 'Invalid fields' });
    if (!['upi','cash','card'].includes(method))
      return res.status(400).json({ error: 'Invalid method' });
    const result = await addTransaction(1, customerId, amount, method);
    await invalidateCache(KEYS.todayCollection(1));
    await invalidateCache(KEYS.stats(1));
    if (result.hasPendingUdhaar && result.pendingDueDate) {
      const dueDate = new Date(result.pendingDueDate);
      const today = new Date();
      const eventType = dueDate > today ? 'PAID_EARLY' : 'PAID_ONTIME';
      const delta = eventType === 'PAID_EARLY' ? 5 : 2;
      await addScoreEvent(customerId, eventType, delta, `Payment of ₹${amount} recorded`);
      await invalidateCache(KEYS.score(customerId));
    }
    res.json({ success: true, ...result });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;
