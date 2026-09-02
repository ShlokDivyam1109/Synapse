import { Router } from "express";
import { analyzeMentalHealth } from "../gemini";

const router = Router();

/**
 * POST /api/mental-health
 * body: {
 *   answers: Array<{ question: string; answer: string }>
 * }
 */
router.post("/mental-health", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid answers payload" });
    }

    // Convert answers into readable text for Gemini
    const userText = answers
      .map(
        (a: any, index: number) =>
          `Q${index + 1}: ${a.question}\nAnswer: ${a.answer}`
      )
      .join("\n\n");

    const result = await analyzeMentalHealth(userText);

    return res.json(result);

  } catch (error: any) {
    console.error("Mental health API error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to analyze mental health",
      details: error?.message ?? String(error),
    });
  }
});

export default router;
