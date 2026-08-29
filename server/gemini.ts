const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing");
}

export async function analyzeMentalHealth(userText: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
Return ONLY valid JSON without any backticks or markdown.

{
  "percentage": number,
  "rating": "Very Good" | "Good" | "Moderate" | "Poor",
  "suggestions": string[]
}

User responses:
${userText}
                `,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await res.json();

  if (data.error) {
    console.error("Gemini API error:", data.error);
    throw new Error(data.error.message);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");

  // Clean the response: remove backticks and "json" marker
  const cleanText = text.replace(/```json|```/g, '').trim();

  return JSON.parse(cleanText);
}
