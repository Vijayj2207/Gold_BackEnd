import { Router } from "express";
import { getCurrentRatesController } from "../controllers/rate.controller";

const router = Router();

router.get("/current-rates", getCurrentRatesController);

export default router;
