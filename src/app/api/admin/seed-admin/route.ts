import { NextResponse } from 'next/server';
import { seedAdminUser } from '@/lib/seedAdmin';

export async function GET() {
  try {
    const result = await seedAdminUser();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
