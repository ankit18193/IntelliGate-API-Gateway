import { Decision, AuditLog } from "@/types/optimization.types";

export const logAction = (decision: Decision, reason: string): AuditLog => {
  const log: AuditLog = {
    action: decision.action,
    endpoint: decision.target,
    reason,
    time: new Date().toISOString(),
  };

  console.log(log);

  return log;
};