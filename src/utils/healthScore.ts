export const calculateHealth = (
  avgLatency: number,
  errorRate: number
) => {
  let score = 100;

  
  if (avgLatency > 500) score -= 40;
  else if (avgLatency > 200) score -= 20;
  else if (avgLatency > 100) score -= 10;

  
  if (errorRate > 20) score -= 40;
  else if (errorRate > 10) score -= 20;
  else if (errorRate > 5) score -= 10;

  score = Math.max(score, 0);

  let status = "Excellent";
  if (score < 80) status = "Good";
  if (score < 60) status = "Poor";
  if (score < 40) status = "Critical";

  return { score, status };
};