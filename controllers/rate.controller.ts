import { Request, Response } from "express";
import { getCurrentRatesService } from "../services/rate.service";

export const getCurrentRatesController = async (
  req: Request,
  res: Response
) => {
  try {
    const rates = await getCurrentRatesService();

    res.status(200).json({
      success: true,
      data: rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rates",
    });
  }
};
