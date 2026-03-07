export interface MetalRate {
  name: string;
  today: number;
  yesterday: number;
  change: number;
  trend: "up" | "down" | "same";
}

export interface RateResponse {
  gold24k: MetalRate;
  gold22k: MetalRate;
  silver: MetalRate;
  diamond: MetalRate;
}
