import { Request, Response, Router } from "express";
import { addCustomer, getAllCustomers, updateWhatsappConsent } from "../queries";

const router = Router();

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

export default router;
