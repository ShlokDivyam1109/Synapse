export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const answers = body.answers;

    if (!answers || !Array.isArray(answers)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid answers payload" }),
      };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Gemini API key missing" }),
      };
    }

    // Convert answers into readable text for Gemini
    const userText = answers
      .map(
        (a: any, index: number) =>
          `Q${index + 1}: ${a.question}\nAnswer: ${a.answer}`
      )
      .join("\n\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: data.error.message }),
      };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Empty Gemini response" }),
      };
    }

    const cleanText = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanText);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
