import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const username = process.env.DIGIFLAZZ_USERNAME!;
  const apiKey = process.env.DIGIFLAZZ_API_KEY!;
  
  // Formula signature cek saldo: md5(username + apiKey + "depo")
  const sign = crypto.createHash('md5').update(`${username}${apiKey}depo`).digest('hex');

  try {
    const res = await fetch('https://api.digiflazz.com/v1/cek-saldo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'deposit', username, sign }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghubungi Digiflazz' }, { status: 500 });
  }
}
