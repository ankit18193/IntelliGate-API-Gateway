export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI!,
  redisHost: process.env.REDIS_HOST!,
  redisPort: Number(process.env.REDIS_PORT),
  jwtSecret: process.env.JWT_SECRET!,
};