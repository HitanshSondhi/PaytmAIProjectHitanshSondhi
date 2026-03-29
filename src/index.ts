import "dotenv/config";
import cors from "cors";
import cronRouter from "./routes/cron";
import customersRouter from "./routes/customers";
import express, { NextFunction, Request, Response } from "express";
import remindRouter from "./routes/remind";
import scoreRouter from "./routes/score";
import statsRouter from "./routes/stats";
import testWhatsappRouter from "./routes/test-whatsapp";
import transactionsRouter from "./routes/transactions";
import udhaarRouter from "./routes/udhaar";
import voiceRouter from "./routes/voice";

const app = express();
const PORT = process.env.PORT ?? 3001;

const frontendUrl = (process.env.FRONTEND_URL ?? '').trim();
const frontendUrls = (process.env.FRONTEND_URLS ?? '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  frontendUrl || 'http://localhost:5173',
  ...frontendUrls,
  'https://paytm-ai-project-hitansh-sondhi.vercel.app',
  /https:\/\/paytm-ai-project-hitansh-sondhi.*\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, cron jobs)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((o) =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-cron-secret'],
}));

app.use(express.json());

// Health check — always first
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount all routes
app.use('/api/voice', voiceRouter);
app.use('/api/udhaar', udhaarRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/score', scoreRouter);
app.use('/api/stats', statsRouter);
app.use('/api/remind', remindRouter);
app.use('/api/customers', customersRouter);
app.use('/api/cron', cronRouter);
app.use('/api/test-whatsapp', testWhatsappRouter);

// Global error handler
app.use((err: Error, _req: Request, res: Response,
  _next: NextFunction) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({
    responseText: 'Server error. Dobara try karein.',
    responseType: 'unknown',
    responseData: {},
    orbState: 'success',
  });
});

app.listen(PORT, () => {
  console.log(`Voice Ledger API running on port ${PORT}`);
});

export default app;
