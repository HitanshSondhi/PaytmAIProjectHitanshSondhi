import { Request, Response, Router } from "express";
import { KEYS, invalidateCache } from "../cache";
import { addCustomer, deleteCustomer, getAllCustomers, updateWhatsappConsent } from "../queries";

const router = Router();

function getIndiaDate(offsetDays: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const sortBy = (req.query.sort as string) || 'name';
    const customers = await getAllCustomers(1, sortBy);
    res.json({ customers });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body as { name: string; phone: string };
    if (!name?.trim() || !phone?.trim())
      return res.status(400).json({ error: 'name and phone required' });
    const customer = await addCustomer(1, name.trim(), phone.trim());
    res.json({ success: true, customer });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

router.patch('/:id/consent', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { consent } = req.body as { consent: boolean };
    if (typeof consent !== 'boolean')
      return res.status(400).json({ error: 'consent must be boolean' });
    await updateWhatsappConsent(id, consent);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ error: 'invalid customer id' });
    const deleted = await deleteCustomer(1, id);
    if (!deleted)
      return res.status(404).json({ error: 'customer not found' });

    const today = getIndiaDate(0);
    const tomorrow = getIndiaDate(1);
    await invalidateCache(KEYS.stats(1));
    await invalidateCache(KEYS.dueList(1, today));
    await invalidateCache(KEYS.dueList(1, tomorrow));
    await invalidateCache(KEYS.score(id));

    res.json({ success: true, customer: deleted });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

export default router;
