export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  // Convert your conversation history to Gemini's format
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `You are Aria, a warm and professional AI receptionist for "Glamour Studio"...` }]  // your full system prompt
        },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 1000 }
      })
    }
  );

  const data = await response.json();

  // Reformat to match what your frontend expects
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I'm unavailable right now!";
  res.status(200).json({ content: [{ text }] });
}