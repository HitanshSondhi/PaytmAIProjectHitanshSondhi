import twilio from "twilio";
import { Request, Response, Router } from "express";
import { KEYS, invalidateCache } from "../cache";
import { getAllUdhaar, getDecryptedPhone, markReminderSent } from "../queries";

const router = Router();

// Initialize Twilio client
// Supports both Account SID + Auth Token OR API Key authentication
const twilioClient = process.env.TWILIO_API_KEY && process.env.TWILIO_API_SECRET
  ? twilio(
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { accountSid: process.env.TWILIO_ACCOUNT_SID }
    )
  : twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

interface UdhaarEntry {
  id: number;
  customer_id: number;
  customer_name: string;
  amount: number;
  due_date: string;
  whatsapp_consent: boolean;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { udhaarId } = req.body as { udhaarId: number };
    if (!udhaarId) return res.status(400).json({ error: 'udhaarId required' });

    const ledger = await getAllUdhaar(1) as UdhaarEntry[];
    const entry = ledger.find((u) => u.id === udhaarId);
    if (!entry) return res.status(404).json({ error: 'Udhaar not found' });
    if (!entry.whatsapp_consent) return res.status(403).json({ error: 'No WhatsApp consent' });

    const phone = await getDecryptedPhone(entry.customer_id);
    if (!phone) return res.status(400).json({ error: 'No phone number' });

    const dueDate = new Date(entry.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);

    const message = daysOverdue <= 0
      ? `Namaste ${entry.customer_name} ji, aapka ₹${entry.amount} ka payment aaj due hai. Please Sharma Kirana Store mein payment kar dijiye. Dhanyavaad!`
      : `Reminder: ${entry.customer_name} ji, aapka ₹${entry.amount} ka payment ${daysOverdue} din se pending hai. Jaldi payment karein. - Sharma Kirana Store`;

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${phone}`,
      body: message,
    });

    await markReminderSent(udhaarId);
    await invalidateCache(KEYS.dueList(1, today.toISOString().split('T')[0]));

    res.json({
      success: true,
      sentTo: `****${phone.slice(-4)}`,
    });
  } catch (e) {
    console.error('[Remind]', e);
    res.status(500).json({ error: 'WhatsApp nahi bheja ja saka.' });
  }
});

export default router;
