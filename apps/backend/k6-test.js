import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  vus: 50,
  duration: "20s",
};

export default function () {
  const res = http.get("http://localhost:4000/api/gateway/public");

 
  if (res.status !== 200 && res.status !== 429) {
    console.log("❌ STATUS:", res.status);
    console.log("BODY:", res.body);
  }

  check(res, {
    "status is 200 or 429": (r) => r.status === 200 || r.status === 429,
  });

  sleep(0.5);
}