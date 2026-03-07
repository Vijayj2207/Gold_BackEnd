import axios from "axios";
import { RateResponse } from "../types/rate.types";

const EXTERNAL_API =
  "https://api.example.com/gold-rate/chennai"; // replace with real API

function calculateTrend(today: number, yesterday: number) {
  const change = today - yesterday;

  return {
    change,
    trend:
      change > 0 ? "up" :
      change < 0 ? "down" :
      "same",
  };
}

export const getCurrentRatesService = async (): Promise<RateResponse> => {
  const response = await axios.get(EXTERNAL_API);

  const data = response.data;

  // Example external response mapping
  const gold24Today = data.gold24.today;
  const gold24Yesterday = data.gold24.yesterday;

  const gold22Today = data.gold22.today;
  const gold22Yesterday = data.gold22.yesterday;

  const silverToday = data.silver.today;
  const silverYesterday = data.silver.yesterday;

  const diamondToday = data.diamond.today;
  const diamondYesterday = data.diamond.yesterday;

  const gold24Trend = calculateTrend(gold24Today, gold24Yesterday);
  const gold22Trend = calculateTrend(gold22Today, gold22Yesterday);
  const silverTrend = calculateTrend(silverToday, silverYesterday);
  const diamondTrend = calculateTrend(diamondToday, diamondYesterday);

  return {
    gold24k: {
      name: "24K Gold",
      today: gold24Today,
      yesterday: gold24Yesterday,
      change: gold24Trend.change,
      trend: gold24Trend.trend,
    },
    gold22k: {
      name: "22K Gold",
      today: gold22Today,
      yesterday: gold22Yesterday,
      change: gold22Trend.change,
      trend: gold22Trend.trend,
    },
    silver: {
      name: "Silver",
      today: silverToday,
      yesterday: silverYesterday,
      change: silverTrend.change,
      trend: silverTrend.trend,
    },
    diamond: {
      name: "Diamond",
      today: diamondToday,
      yesterday: diamondYesterday,
      change: diamondTrend.change,
      trend: diamondTrend.trend,
    },
  };
};
