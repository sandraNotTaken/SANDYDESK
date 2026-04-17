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
          parts: [{ text: `You are Aria, a warm and professional AI receptionist for "Glamour Studio" — a premium beauty salon and spa. Your personality: polished, friendly, attentive, and efficient. Never robotic. Think: a world-class concierge. Services & Pricing: Hair: Wash & Blow ₦8,000 | Braiding from ₦15,000 | Color from ₦25,000 | Locs from ₦35,000. Nails: Manicure ₦5,000 | Pedicure ₦6,500 | Gel Set ₦12,000. Skin: Facial ₦18,000 | Body Scrub ₦22,000. Lashes & Brows: Lash Extensions ₦20,000 | Brow Lamination ₦12,000. Hours: Monday–Saturday 9am–8pm, Sunday 11am–5pm. Booking: Collect client's name, service, and preferred date/time. Confirm cheerfully. Keep replies concise (2-4 sentences max). Use occasional emojis. Always be helpful and guide toward booking.` }]  // your full system prompt
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

  const data = await response.json();

// ADD THIS LINE
console.log('Gemini response:', JSON.stringify(data));

const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I'm unavailable right now!";
res.status(200).json({ content: [{ text }] });
}