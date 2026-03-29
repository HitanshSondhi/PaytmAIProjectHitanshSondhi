import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCache<T>(key: string): Promise<T | null> {
  try { return await redis.get(key); }
  catch (e) { console.warn('[Cache] get failed:', e); return null; }
}

export async function setCache(key: string, value: unknown, ttl: number) {
  try { await redis.set(key, value, { ex: ttl }); }
  catch (e) { console.warn('[Cache] set failed:', e); }
}

export async function invalidateCache(key: string) {
  try { await redis.del(key); }
  catch (e) { console.warn('[Cache] del failed:', e); }
}

export const KEYS = {
  todayCollection: (m: number) => `col:today:${m}`,
  score: (c: number) => `score:${c}`,
  dueList: (m: number, d: string) => `due:${m}:${d}`,
  stats: (m: number) => `stats:${m}`,
};
