export type PredictionResult = 'Won' | 'Lost' | 'Refunded';

export interface Prediction {
  id: string;
  created_at: string;
  match_date: string;
  team_a: string;
  team_b: string;
  tournament: string;
  prediction_text: string;
  odds: number;
  stake: number;
  result: PredictionResult;
  profit_loss: number;
  notes?: string;
}
