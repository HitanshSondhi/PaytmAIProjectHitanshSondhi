import { Request, Response, Router } from "express";
import { KEYS, invalidateCache } from "../cache";
import { addScoreEvent, addTransaction } from "../queries";
import { getScoreDelta } from "../scoringEngine";

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
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      let eventType: string;
      if (today < dueDate) {
        eventType = 'PAID_EARLY';
      } else if (today.getTime() === dueDate.getTime()) {
        eventType = 'PAID_ONTIME';
      } else {
        const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);
        if (daysLate <= 3) eventType = 'PAID_LATE_1_3';
        else if (daysLate <= 7) eventType = 'PAID_LATE_4_7';
        else eventType = 'PAID_LATE_7_PLUS';
      }
      const delta = getScoreDelta(eventType);
      await addScoreEvent(customerId, eventType, delta, `Payment of ₹${amount} recorded`);
      await invalidateCache(KEYS.score(customerId));
    }
    res.json({ success: true, ...result });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;
