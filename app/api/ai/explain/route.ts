import { NextResponse } from 'next/server';
import { aiExplainCode } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Missing code or language parameter' }, { status: 400 });
    }

    const result = await aiExplainCode(code, language);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('AI Explain Error:', err);
    return NextResponse.json({ error: err.message || 'AI explanation failed' }, { status: 500 });
  }
}
