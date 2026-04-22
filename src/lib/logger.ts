import winston from "winston";

 
export type LogEvent = {
  requestId?: string; 
  event:
    | "request_in"
    | "request_out"
    | "cache_hit"
    | "cache_miss"
    | "rate_limit"
    | "error"
    | "auth"
    | "optimization"
    | "circuit_block"   
    | "failure_block";   

  endpoint?: string;
  method?: string;
  status?: number;
  latency?: number;
  userId?: string | null;
  message?: string;

  timestamp: string;
};

 
const baseLogger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),

     
    winston.format.printf((info) => {
      const log = typeof info.message === "object" ? info.message : { message: info.message };

      return JSON.stringify({
        level: info.level,
        timestamp: info.timestamp,
        ...log,
      });
    }),
  ),

  transports: [new winston.transports.Console()],
});

 
export const logger = {
  info: (log: LogEvent) => {
    baseLogger.info(log);
  },

  warn: (log: LogEvent) => {
    baseLogger.warn(log);
  },

  error: (log: LogEvent) => {
    baseLogger.error(log);
  },
};