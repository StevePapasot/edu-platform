import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Το API Key λείπει.' }, { status: 500 });
    }

    // ΑΛΛΑΓΗ: Ζητάμε το σύγχρονο μοντέλο gemini-2.5-flash !
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Σφάλμα από το Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Gemini API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Αποτυχία παραγωγής περιεχομένου.' }, { status: 500 });
  }
}