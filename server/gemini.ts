const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing");
}

export async function analyzeMentalHealth(userText: string) {
  // Netlify/Lambda kills the whole function at ~30s regardless of what's
  // in flight, which produces an opaque "Sandbox.Timedout" with no useful
  // message. Time this call out well before that so a slow Gemini response
  // fails fast with a real error instead of taking the whole request down.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
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
          // This task just needs a JSON verdict, not multi-step reasoning —
          // disabling "thinking" cuts latency (and thinking-token cost).
          generationConfig: {
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Gemini request timed out after 20s");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

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
