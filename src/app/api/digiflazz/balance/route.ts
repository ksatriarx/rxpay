import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const username = process.env.DIGIFLAZZ_USERNAME!;
    const apiKey = process.env.DIGIFLAZZ_API_KEY!;
    const fixieUrl = process.env.FIXIE_URL!;

    let cleanProxy = fixieUrl.trim().replace(/^https?:\/\//i, '');
    let finalProxyUrl = `http://${cleanProxy}`;
    const agent = new HttpsProxyAgent(new URL(finalProxyUrl));
    const sign = crypto.createHash('md5').update(`${username}${apiKey}depo`).digest('hex');

    const res = await fetch('https://api.digiflazz.com/v1/cek-saldo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'deposit', username, sign }),
      agent: agent as any,
    });

    const data = await res.json() as any;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: `Gagal Koneksi: ${error.message}` }, { status: 500 });
  }
}
