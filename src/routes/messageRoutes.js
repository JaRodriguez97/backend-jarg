import express from "express";
import { handleIncomingMessage } from "../controllers/messageController.js";
import { validateOportunity } from "../middlewares/validateOportunity.js";

const router = express.Router();

router.post("/", validateOportunity, handleIncomingMessage);

export default router;
