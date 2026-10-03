import { NextResponse } from 'next/server';
import { aiFixCode } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { code, language, error } = await req.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Missing code or language parameter' }, { status: 400 });
    }

    const result = await aiFixCode(code, language, error || 'Compilation/Execution error');
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('AI Fix Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to auto-fix code with AI' }, { status: 500 });
  }
}
