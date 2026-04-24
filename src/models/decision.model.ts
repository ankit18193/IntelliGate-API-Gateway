import mongoose, { Document, Schema } from "mongoose";

export interface IDecisionLog extends Document {
  endpoint: string;
  action: string;
  reason: string;
  impact: string;
  timestamp: Date;
}

const decisionSchema = new Schema<IDecisionLog>({
  endpoint: { type: String, required: true },
  action: { type: String, required: true },
  reason: { type: String, required: true },
  impact: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const DecisionModel =
  mongoose.models.Decision ||
  mongoose.model<IDecisionLog>("Decision", decisionSchema);