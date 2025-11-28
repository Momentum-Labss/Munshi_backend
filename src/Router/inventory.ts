import { Router } from "express";
import { inventoryController } from "../controllers/inventoryController";

const router = Router();

// GET /api/v1/inventory?page=1&limit=10&search=rice&type=LOOSE&lowStock=true
router.get("/", inventoryController.listProducts);

// POST /api/v1/inventory/voice-command
router.post("/voice-command", inventoryController.voiceAdd);

export default router;