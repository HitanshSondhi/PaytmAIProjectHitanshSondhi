import twilio from "twilio";
import { Request, Response, Router } from "express";
import { KEYS, invalidateCache } from "../cache";
import {
  addScoreEvent,
  getDecryptedPhone,
  getOverduePenaltyCandidates,
  getPendingReminders,
  hasScoreEventForTagToday,
  markReminderSent,
} from "../queries";

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

interface ReminderEntry {
  id: number;
  amount: number;
  due_date: string;
  customer_id: number;
  name: string;
  whatsapp_consent: boolean;
  days_overdue: string;
}

router.get('/reminders', async (req: Request, res: Response) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET)
    return res.status(403).json({ error: 'Unauthorized' });

  const entries = await getPendingReminders(1) as ReminderEntry[];
  let sent = 0, skipped = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    try {
      const phone = await getDecryptedPhone(entry.customer_id);
      if (!phone) { skipped++; continue; }
      const daysOverdue = parseInt(entry.days_overdue);
      const message = daysOverdue <= 0
        ? `Namaste ${entry.name} ji, aapka ₹${entry.amount} ka payment aaj due hai. - Sharma Kirana`
        : `Reminder: ${entry.name} ji, ₹${entry.amount} ${daysOverdue} din se pending hai. - Sharma Kirana`;
      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM!,
        to: `whatsapp:${phone}`,
        body: message,
      });
      await markReminderSent(entry.id);
      sent++;
    } catch (e) {
      errors.push(`${entry.name}: ${(e as Error).message}`);
      skipped++;
    }
  }
  res.json({ sent, skipped, errors });
});

router.get('/score-adjustments', async (req: Request, res: Response) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET)
    return res.status(403).json({ error: 'Unauthorized' });

  const candidates = await getOverduePenaltyCandidates(1);
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const candidate of candidates) {
    try {
      const days = candidate.maxOverdueDays;

      let eventType = 'LATE_1_3';
      let delta = -5;
      if (days >= 8) {
        eventType = 'LATE_7_PLUS';
        delta = -20;
      } else if (days >= 4) {
        eventType = 'LATE_4_7';
        delta = -10;
      }

      // Prevent duplicate deductions if cron runs multiple times in one day.
      const tag = `AUTO_DAILY_OVERDUE:${new Date().toISOString().split('T')[0]}`;
      const alreadyApplied = await hasScoreEventForTagToday(candidate.customerId, tag);
      if (alreadyApplied) {
        skipped++;
        continue;
      }

      await addScoreEvent(
        candidate.customerId,
        eventType,
        delta,
        `${tag}: ${days} days overdue`
      );
      await invalidateCache(KEYS.score(candidate.customerId));
      updated++;
    } catch (e) {
      errors.push(`customer ${candidate.customerId}: ${(e as Error).message}`);
      skipped++;
    }
  }

  res.json({
    processed: candidates.length,
    updated,
    skipped,
    errors,
  });
});

export default router;
