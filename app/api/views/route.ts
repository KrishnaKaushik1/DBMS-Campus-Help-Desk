import { NextResponse } from 'next/server';
import redisClient from '@/lib/redis';

export async function GET() {
  try {
    const views = await redisClient.incr('help:views');
    return NextResponse.json({ views });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}