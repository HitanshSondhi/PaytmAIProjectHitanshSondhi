// Scheduler that sends WhatsApp test every 5 minutes
require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

const client = twilio(accountSid, authToken);
const targetPhone = '+919315351311';

let messageCount = 0;

async function sendReminder() {
  messageCount++;
  const now = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
  const date = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  
  const message = `🔔 Payment Reminder - Sharma Kirana Store

Namaste! 🙏

Aapka ₹500 ka udhaar payment aaj (${date}) due hai.

Kripya jaldi se payment kar dijiye. Aap store par aakar ya UPI se payment kar sakte hain.

UPI: sharma.kirana@paytm

Dhanyavaad!
- Sharma Kirana Store
📞 Contact: +91 98765 43210`;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`[${now}] Sending reminder #${messageCount}...`);
  
  try {
    const msg = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${targetPhone}`,
      body: message,
    });
    
    console.log(`✅ Message sent! SID: ${msg.sid}`);
    console.log(`Status: ${msg.status}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    if (err.code === 63007) {
      console.log('\n⚠️  Recipient must join sandbox first!');
      console.log('Send "join swing-over" to +14155238886 on WhatsApp');
    }
  }
}

console.log('='.repeat(50));
console.log('WhatsApp Scheduler Started!');
console.log('='.repeat(50));
console.log(`Target: ${targetPhone}`);
console.log(`From: ${whatsappFrom}`);
console.log('Interval: Every 5 minutes');
console.log('Press Ctrl+C to stop\n');

// Send immediately on start
sendReminder();

// Then every 5 minutes (300000 ms)
setInterval(sendReminder, 5 * 60 * 1000);

console.log('Scheduler running... waiting for next interval.');
