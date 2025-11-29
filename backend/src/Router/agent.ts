import { Router } from "express";
import { agentController } from "../controllers/agentController";
import { authenticate } from "../middleware/auth";

const router = Router();

// POST /api/v1/agent/ask
// Body: { "query": "aaj ki sale kitni hui?" } OR { "query": "50 coke add karo" }
router.post("/ask", authenticate, agentController.ask);

router.post('/ask/stream', authenticate, agentController.askStream);

export default router;