'use strict';
// ─────────────────────────────────────────────────────────────────────────────
//  BookSmart AI Controller  –  Gemini-powered dispatch chat assistant
//  Route: POST /api/ai/chat
//  Body:  { messages: [{role:'user'|'assistant', content:'...'}] }
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_KEY   = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

const SYSTEM_PROMPT = `You are BookSmart, an elite AI dispatch assistant for TruFleet — a world-class fleet management company. Your job is to help users book a vehicle/trip through a warm, intelligent conversation.

CONVERSATION FLOW (follow this order naturally):
1. Greet the user and ask where they need to go (origin → destination).
2. Ask if the trip is urgent / scheduled / planned in advance.
3. Ask if they are willing to pay extra for premium, faster, or executive-class service.
4. Ask if they are transporting cargo (type + weight) OR passengers (how many).
5. Ask for any special requirements or notes.

INTELLIGENT DECISION RULES:
- "urgent" / "ASAP" / "emergency" / "right now" → priority = "emergency"
- "important" / "need it soon" → priority = "high"
- "willing to pay extra" / "premium" / "executive" / "VIP" / "want the best" → priority = "vip"
- default → priority = "standard"

Vehicle type rules:
- vip priority → vehicle_type = "Car", functional_category = "VIP transport"
- emergency priority → vehicle_type = "Car", functional_category = "Emergency"
- passengers > 10 → vehicle_type = "Bus", functional_category = "Passenger"
- cargo mentioned → vehicle_type = "Truck", functional_category = "Cargo"
- heavy/hazardous cargo → vehicle_type = "Truck", functional_category = "Cargo"
- default → vehicle_type = "Car", functional_category = "Passenger"

STYLE:
- Be warm, confident, and concise (2–3 sentences max per response).
- Use natural language. Don't bullet-point your replies.
- If the user provides multiple details at once, acknowledge them and ask only about what's still missing.
- When you have at minimum origin + destination + urgency level, you have enough to fill the form.

FORM DATA OUTPUT:
When ready, append EXACTLY this block at the very end of your message (no extra text after it):

[FORM_DATA]
{
  "origin": "...",
  "destination": "...",
  "priority": "standard|high|emergency|vip",
  "vehicle_type": "Car|Bus|Truck|EV|Two-wheeler",
  "functional_category": "Passenger|Cargo|VIP transport|Emergency|Maintenance",
  "passenger_count": 1,
  "cargo_type": "",
  "cargo_weight": "",
  "distance_km": null,
  "notes": "",
  "is_ready": true
}
[/FORM_DATA]

Estimate distance_km (rough km) based on city names if known, otherwise null.
Set is_ready: true ONLY when you have origin AND destination.
Do NOT output is_ready: true if either origin or destination is missing.`;

// Fixed opening exchange — keeps the Gemini API stateless
const SEED_EXCHANGE = [
    {
        role:  'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\nUser just opened the BookSmart chat. Greet them.' }]
    },
    {
        role:  'model',
        parts: [{ text: "Hi there! I'm BookSmart, your intelligent trip booking assistant 🚀 I'll help you get the perfect vehicle arranged in seconds. Where are you heading — what's the pickup point and destination?" }]
    }
];

// ─────────────────────────────────────────────────────────────────────────────
exports.chatDispatch = async (req, res) => {
    try {
        if (!GEMINI_KEY) {
            return res.status(503).json({ error: 'AI service is not configured on this server.' });
        }

        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: '`messages` array is required.' });
        }

        // Build Gemini contents array: seed exchange + user conversation history
        const contents = [...SEED_EXCHANGE];
        for (const msg of messages) {
            if (!msg.role || !msg.content) continue;
            contents.push({
                role:  msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(msg.content) }]
            });
        }

        const payload = {
            contents,
            generationConfig: {
                temperature:      0.75,
                maxOutputTokens:  512,
                topP:             0.92
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT',    threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH',   threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
            ]
        };

        const geminiRes = await fetch(GEMINI_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
            signal:  AbortSignal.timeout(18000)
        });

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error('[BookSmart AI] Gemini HTTP error:', geminiRes.status, errText.slice(0, 200));
            return res.status(502).json({ error: 'AI service temporarily unavailable. Please try again.' });
        }

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!rawText) {
            console.error('[BookSmart AI] Empty Gemini response:', JSON.stringify(geminiData).slice(0, 300));
            return res.status(502).json({ error: 'AI returned an empty response. Please try again.' });
        }

        // ── Parse structured form data block ────────────────────────────
        let reply    = rawText.trim();
        let formData = null;

        const fdMatch = rawText.match(/\[FORM_DATA\]([\s\S]*?)\[\/FORM_DATA\]/);
        if (fdMatch) {
            try {
                formData = JSON.parse(fdMatch[1].trim());
            } catch (parseErr) {
                console.warn('[BookSmart AI] Failed to parse FORM_DATA JSON:', parseErr.message);
            }
            // Strip the block from the visible reply
            reply = rawText.replace(/\[FORM_DATA\][\s\S]*?\[\/FORM_DATA\]/, '').trim();
        }

        return res.json({ reply, formData });

    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            return res.status(504).json({ error: 'AI is taking too long. Please try again shortly.' });
        }
        console.error('[BookSmart AI] Unexpected error:', err.message);
        return res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/ai/greeting  –  Returns the fixed opening message (no Gemini call)
// ─────────────────────────────────────────────────────────────────────────────
exports.getGreeting = (_req, res) => {
    res.json({
        reply: "Hi there! I'm BookSmart, your intelligent trip booking assistant 🚀 I'll help you get the perfect vehicle arranged in seconds. Where are you heading — what's the pickup point and destination?"
    });
};
