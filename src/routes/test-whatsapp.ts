import twilio from "twilio";
import { Request, Response, Router } from "express";

const router = Router();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Test endpoint - sends WhatsApp message directly to specified number
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { phone, message } = req.body as { phone?: string; message?: string };
    
    // Default test number and message
    const targetPhone = phone || '+919315351311';
    const testMessage = message || `Namaste! 🙏 This is a test reminder from Voice Ledger.

Aapka ₹500 ka payment aaj due hai. Please Sharma Kirana Store mein payment kar dijiye.

Dhanyavaad! - Sharma Kirana Store`;

    console.log(`[Test WhatsApp] Sending to ${targetPhone}...`);
    
    const msg = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${targetPhone}`,
      body: testMessage,
    });

    console.log(`[Test WhatsApp] ✅ Sent! SID: ${msg.sid}`);
    
    res.json({
      success: true,
      messageSid: msg.sid,
      status: msg.status,
      sentTo: `****${targetPhone.slice(-4)}`,
    });
  } catch (e) {
    const error = e as Error & { code?: number };
    console.error('[Test WhatsApp] ❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      hint: error.code === 63007 
        ? 'Recipient must join sandbox first. Send "join swing-over" to +14155238886'
        : undefined
    });
  }
});

// GET endpoint for easy browser testing
router.get('/send', async (req: Request, res: Response) => {
  try {
    const phone = (req.query.phone as string) || '+919315351311';
    const amount = req.query.amount || '500';
    const customerName = req.query.name || 'Customer';
    const date = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    
    const message = `🔔 Payment Reminder - Sharma Kirana Store

Namaste ${customerName} ji! 🙏

Aapka ₹${amount} ka udhaar payment aaj (${date}) due hai.

Kripya jaldi se payment kar dijiye. Aap store par aakar ya UPI se payment kar sakte hain.

UPI: sharma.kirana@paytm

Dhanyavaad!
- Sharma Kirana Store
📞 Contact: +91 98765 43210`;

    console.log(`[Test WhatsApp GET] Sending to ${phone}...`);
    
    const msg = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:${phone}`,
      body: message,
    });

    console.log(`[Test WhatsApp GET] ✅ Sent! SID: ${msg.sid}`);
    
    res.json({
      success: true,
      messageSid: msg.sid,
      status: msg.status,
      sentTo: phone,
      time: new Date().toISOString(),
    });
  } catch (e) {
    const error = e as Error & { code?: number };
    console.error('[Test WhatsApp GET] ❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
});

export default router;
