import "dotenv/config";
import cors from "cors";
import cronRouter from "./routes/cron";
import customersRouter from "./routes/customers";
import express, { NextFunction, Request, Response } from "express";
import remindRouter from "./routes/remind";
import scoreRouter from "./routes/score";
import statsRouter from "./routes/stats";
import transactionsRouter from "./routes/transactions";
import udhaarRouter from "./routes/udhaar";
import voiceRouter from "./routes/voice";
import testWhatsappRouter from "./routes/test-whatsapp";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
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
