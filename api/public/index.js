const SYSTEM_PROMPT = `You are Aria, a warm and professional AI receptionist for "Glamour Studio" — a premium beauty salon and spa.

Your personality: polished, friendly, attentive, and efficient. Never robotic. Think: a world-class concierge.

Services & Pricing (make up realistic prices in Naira):
- Hair: Wash & Blow ₦8,000 | Braiding from ₦15,000 | Color from ₦25,000 | Locs from ₦35,000
- Nails: Manicure ₦5,000 | Pedicure ₦6,500 | Gel Set ₦12,000
- Skin: Facial ₦18,000 | Body Scrub ₦22,000
- Lashes & Brows: Lash Extensions ₦20,000 | Brow Lamination ₦12,000

Hours: Monday–Saturday 9am–8pm, Sunday 11am–5pm

Booking: Collect client's name, service, and preferred date/time. Confirm cheerfully.

Keep replies concise (2-4 sentences max). Use occasional emojis. Always be helpful and guide toward booking.`;

let conversationHistory = [];
let isLoading = false;

function addMessage(text, role) {
  const body = document.getElementById('chatBody');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `
    <div class="msg-avatar">${role === 'ai' ? 'AI' : 'You'}</div>
    <div class="msg-bubble">${text}</div>
  `;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function addTypingIndicator() {
  const id = 'typing-' + Date.now();
  const body = document.getElementById('chatBody');
  const div = document.createElement('div');
  div.className = 'msg ai'; div.id = id;
  div.innerHTML = `<div class="msg-avatar">AI</div><div class="msg-bubble typing-cursor" style="color:var(--muted);font-style:italic;font-size:0.7rem;">Aria is typing</div>`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const btn = document.getElementById('chatSendBtn');
  const msg = input.value.trim();
  if (!msg || isLoading) return;

  addMessage(msg, 'user');
  input.value = '';
  isLoading = true;
  btn.disabled = true;

  conversationHistory.push({ role: 'user', content: msg });
  const typingId = addTypingIndicator();

  try {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: conversationHistory
    })
  });

    const data = await res.json();
    removeTypingIndicator(typingId);

    const reply = data.content?.[0]?.text || "Sorry, I'm having trouble right now. Please WhatsApp us directly!";
    conversationHistory.push({ role: 'assistant', content: reply });
    addMessage(reply, 'ai');
  } catch (err) {
    removeTypingIndicator(typingId);
    addMessage("I'm momentarily unavailable — please WhatsApp us and we'll respond within minutes! 📱", 'ai');
  }

  isLoading = false;
  btn.disabled = false;
}

function initChat() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
  document.getElementById('chatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
}

document.addEventListener('DOMContentLoaded', initChat);
