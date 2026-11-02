import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { HttpProxyAgent } from 'hpagent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const username = process.env.DIGIFLAZZ_USERNAME!;
    const apiKey = process.env.DIGIFLAZZ_API_KEY!;
    
    let rawProxyUrl = (process.env.FIXIE_URL || '').trim();
    let proxyUrl = rawProxyUrl.replace('https://', 'http://');
    if (!proxyUrl.startsWith('http://')) {
        proxyUrl = 'http://' + rawProxyUrl.replace(/^(https?:\/\/)?/, '');
    }

    const agent = new HttpProxyAgent({ proxy: proxyUrl });
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
