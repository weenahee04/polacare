export interface RetinalAgeResult {
  predictedAge: number;
  actualAge: number;
  gap: number;
  confidence: number;
  riskFactors: string[];
  analysisText: string;
}

