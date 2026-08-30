import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function issueToken(res: any, user: { _id: any; instituteId: any; role: string }) {
  const token = jwt.sign(
    { userId: user._id.toString(), instituteId: user.instituteId.toString(), role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );
  res.cookie("token", token, COOKIE_OPTIONS);
}

function sanitize(user: any) {
  const obj = user.toObject ? user.toObject() : user;
  const { passwordHash, ...rest } = obj;
  return rest;
}

// Accounts are provisioned directly (seed scripts / admin, not self-service signup),
// since this app assumes institute data already exists in MongoDB by the time a
// student ever logs in. There is intentionally no POST /auth/signup route.

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email or password" });
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  issueToken(res, user);
  res.json({ user: sanitize(user) });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: sanitize(user) });
});

export default router;
