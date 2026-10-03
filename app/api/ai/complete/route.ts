import { NextResponse } from 'next/server';
import { aiCompleteCode } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { code, language, prefix } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const completion = await aiCompleteCode(code, language, prefix || '');
    return NextResponse.json({ completion });
  } catch (err: any) {
    console.error('AI Complete Error:', err);
    return NextResponse.json({ error: err.message || 'AI completion failed' }, { status: 500 });
  }
}
