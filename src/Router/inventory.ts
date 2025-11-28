import { Router } from "express";
import { inventoryController } from "../controllers/inventoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/inventory?page=1&limit=10&search=rice&type=LOOSE&lowStock=true
router.get("/", authenticate, inventoryController.listProducts);

// POST /api/inventory/voice-command
router.post("/voice-command", inventoryController.voiceAdd);

export default router;