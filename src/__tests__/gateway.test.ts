import "dotenv/config";
import request from "supertest";

import { redis } from "@/lib/redis";
import { resetCircuitBreaker } from "@/utils/circuitBreaker";
import { resetFailureTracker } from "@/utils/failureTracker";

const BASE_URL = "http://localhost:4000";

describe("Gateway API", () => {

  
  beforeEach(async () => {
    // Reset Redis (cache + rate limit)
    if (redis) {
      await redis.flushall();
    }

    // Reset in-memory systems
    resetCircuitBreaker();
    resetFailureTracker();
  });

  
  afterAll(async () => {
    if (redis) {
      await redis.quit();
    }
  });

   
  it("should return 200 for public route", async () => {
    const res = await request(BASE_URL).get("/api/gateway/public");

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Public route ");
  });

   
  it("should return 401 for private route without auth", async () => {
    const res = await request(BASE_URL).get("/api/gateway/private");

    expect(res.status).toBe(401);
  });

   
  it("should cache response and return faster on second request", async () => {
    const url = `${BASE_URL}/api/gateway/public?test=cache`;

    const start1 = Date.now();
    const res1 = await request(url).get("");
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    const res2 = await request(url).get("");
    const time2 = Date.now() - start2;

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    console.log(`First: ${time1}ms | Second: ${time2}ms`);

    expect(time2).toBeLessThanOrEqual(time1 + 5);
  });

  
  it("should return 429 when rate limit exceeded", async () => {
    const url = `${BASE_URL}/api/gateway/public?test=ratelimit`;

    const requests = [];

    for (let i = 0; i < 100; i++) {
      requests.push(request(url).get(""));
    }

    await Promise.all(requests);

    const lastResponse = await request(url).get("");

    expect(lastResponse.status).toBe(429);
  }, 10000);
});