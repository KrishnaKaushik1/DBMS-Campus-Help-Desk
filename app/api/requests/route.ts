import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import redisClient from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const { student_name, message } = await request.json();

    if (!student_name || !message) {
      return NextResponse.json(
        { success: false, error: "student_name and message are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO help_requests (student_name, message) VALUES ($1, $2) RETURNING id',
      [student_name, message]
    );

    await redisClient.del('help:latest');

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("API Error (POST):", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cachedRequests = await redisClient.get('help:latest');
    
    if (cachedRequests) {
      return NextResponse.json({
        source: "Redis",
        requests: JSON.parse(cachedRequests)
      });
    }

    const result = await pool.query(
      'SELECT id, student_name, message, created_at FROM help_requests ORDER BY id DESC LIMIT 10'
    );
    const requests = result.rows;

    await redisClient.setEx('help:latest', 60, JSON.stringify(requests));

    return NextResponse.json({
      source: "PostgreSQL",
      requests: requests
    });
  } catch (error) {
    console.error("API Error (GET):", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }
    
    await pool.query('DELETE FROM help_requests WHERE id = $1', [id]);
    await redisClient.del('help:latest');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error (DELETE):", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}