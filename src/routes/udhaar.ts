import { Request, Response, Router } from "express";
import { KEYS, invalidateCache } from "../cache";
import { addUdhaar, getAllUdhaar, getCustomerById, markUdhaarPaid } from "../queries";

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const ledger = await getAllUdhaar(1);
    res.json({ ledger });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, amount, dueDays } = req.body;
    if (!customerId || !amount || amount <= 0)
      return res.status(400).json({ error: 'Invalid fields' });
    const result = await addUdhaar(1, customerId, amount, dueDays ?? 7);
    await invalidateCache(KEYS.todayCollection(1));
    res.json({ success: true, ...result });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

// Confirm udhaar - bypass credit score check (used after warning confirmation)
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { customerId, amount, dueDays, lang } = req.body;
    if (!customerId || !amount || amount <= 0)
      return res.status(400).json({ error: 'Invalid fields' });
    
    const customer = await getCustomerById(customerId);
    if (!customer)
      return res.status(404).json({ error: 'Customer not found' });
    
    const result = await addUdhaar(1, customerId, amount, dueDays ?? 7);
    await invalidateCache(KEYS.todayCollection(1));
    
    const responseText = lang === 'en-IN'
      ? `Added ₹${amount} udhaar for ${customer.name}. Due date ${result.dueDate}.`
      : `${customer.name} ka ₹${amount} udhaar add ho gaya. Due date ${result.dueDate}.`;
    
    res.json({
      success: true,
      responseText,
      responseType: 'udhaar_confirmed',
      responseData: { customer: customer.name, amount, dueDate: result.dueDate },
      orbState: 'success',
      ...result
    });
  } catch (e) {
    console.error('[Udhaar Confirm]', e);
    res.status(500).json({ error: 'DB error' });
  }
});

router.post('/:id/paid', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await markUdhaarPaid(id, 1);
    res.json({ success: true, result });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;
