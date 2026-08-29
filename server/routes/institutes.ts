import { Router } from "express";
import { Institute } from "../models/Institute";

const router = Router();

// Public — populates the signup dropdown, no auth required.
router.get("/institutes", async (_req, res) => {
  const institutes = await Institute.find().select("name domain city").sort({ name: 1 });
  res.json({ institutes });
});

export default router;
