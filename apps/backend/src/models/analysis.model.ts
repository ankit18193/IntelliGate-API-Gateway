import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysis extends Document {
  endpoint: string;
  severity: string;
  signals: {
    slow: boolean;
    errorProne: boolean;
    highTraffic: boolean;
  };
  timestamp: Date;
}

const analysisSchema = new Schema<IAnalysis>({
  endpoint: { type: String, required: true },
  severity: { type: String, required: true },
  signals: {
    slow: { type: Boolean, default: false },
    errorProne: { type: Boolean, default: false },
    highTraffic: { type: Boolean, default: false },
  },
  timestamp: { type: Date, default: Date.now },
});

export const AnalysisModel =
  mongoose.models.Analysis ||
  mongoose.model<IAnalysis>("Analysis", analysisSchema);