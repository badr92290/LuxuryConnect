import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRole("CLIENT"));

const vehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100).optional(),
  plate: z.string().optional(),
  color: z.string().optional(),
});

router.get("/", async (req: AuthRequest, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ vehicles });
});

router.post("/", async (req: AuthRequest, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const vehicle = await prisma.vehicle.create({
    data: { ...parsed.data, ownerId: req.user!.userId },
  });
  res.status(201).json({ vehicle });
});

router.patch("/:id", async (req: AuthRequest, res) => {
  const parsed = vehicleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id as string } });
  if (!existing || existing.ownerId !== req.user!.userId)
    return res.status(404).json({ error: "Véhicule introuvable" });

  const vehicle = await prisma.vehicle.update({
    where: { id: existing.id },
    data: parsed.data,
  });
  res.json({ vehicle });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id as string } });
  if (!existing || existing.ownerId !== req.user!.userId)
    return res.status(404).json({ error: "Véhicule introuvable" });

  await prisma.vehicle.delete({ where: { id: existing.id } });
  res.status(204).end();
});

export default router;
