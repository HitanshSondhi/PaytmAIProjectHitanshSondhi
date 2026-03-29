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

const frontendUrls = (process.env.FRONTEND_URLS ?? '')
  .split(',')
  .map((url) => url.trim())
  .filter((url) => url.startsWith('https://'));

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    const isVercelDomain = origin.includes('vercel.app');
    const isAllowedConfiguredOrigin = frontendUrls.includes(origin);
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isVercelDomain || isAllowedConfiguredOrigin || isLocalhost) {
      // Return the exact origin (required when credentials: true)
      callback(null, origin);
      return;
    }

    console.error('[CORS Blocked]', { origin });
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-cron-secret'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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
