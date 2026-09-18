import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { signToken } from "../utils/jwt";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CLIENT", "PROFESSIONAL"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  businessName: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, role, firstName, lastName, phone, businessName } = parsed.data;

  if (role === "PROFESSIONAL" && !businessName) {
    return res.status(400).json({ error: "businessName est requis pour un compte professionnel" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      phone,
      ...(role === "PROFESSIONAL"
        ? { professionalProfile: { create: { businessName: businessName! } } }
        : {}),
    },
    include: { professionalProfile: true },
  });

  const token = signToken({ userId: user.id, role: user.role });
  const { passwordHash: _, ...userSafe } = user;
  res.status(201).json({ token, user: userSafe });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { professionalProfile: true },
  });
  if (!user) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
  }

  const token = signToken({ userId: user.id, role: user.role });
  const { passwordHash: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { professionalProfile: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
  const { passwordHash: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

export default router;
