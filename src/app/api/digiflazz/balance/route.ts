import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { HttpProxyAgent } from 'hpagent';

export const runtime = 'nodejs';

export async function GET() {
  const username = process.env.DIGIFLAZZ_USERNAME!;
  const apiKey = process.env.DIGIFLAZZ_API_KEY!;
  const proxyUrl = (process.env.FIXIE_URL || '').replace('https://', 'http://');
  
  const sign = crypto.createHash('md5').update(`${username}${apiKey}depo`).digest('hex');
  const agent = new HttpProxyAgent({ proxy: proxyUrl });

  try {
    const res = await fetch('https://api.digiflazz.com/v1/cek-saldo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'deposit', username, sign }),
      agent: agent as any,
    });
    
    const data = await res.json() as any;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghubungi Digiflazz' }, { status: 500 });
  }
}
