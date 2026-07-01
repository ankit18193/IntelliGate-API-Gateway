import { IntelliGate } from '@intelligate/sdk';

async function main() {
  console.log("🚀 Starting IntelliGate SDK Demo...\n");

  const client = new IntelliGate({
    baseURL: 'http://localhost:4000/api', // Adjust if backend runs on different port
  });

  console.log("🔐 1. Registering & Logging in new test user...");
  const email = `demo_${Date.now()}@test.com`;
  const password = "securepassword";
  
  await client.auth.register({ email, password });
  const loginRes = await client.auth.login({ email, password });
  console.log(`✅ Logged in! Token: ${loginRes.data.token.slice(0, 10)}...\n`);

  // Initialize a new client with the acquired token
  const authenticatedClient = new IntelliGate({
    baseURL: 'http://localhost:4000/api',
    apiKey: loginRes.data.token
  });

  // 2. Public Gateway Fetch
  console.log("🌐 2. Fetching public gateway route...");
  const publicRes = await authenticatedClient.gateway.public();
  console.log(`✅ Public Response: ${publicRes.data.message}\n`);

  // 3. Private Gateway Fetch
  console.log("🔐 3. Fetching private gateway route...");
  const privateRes = await authenticatedClient.gateway.private();
  console.log(`✅ Private Response: ${privateRes.data.message} (User: ${privateRes.data.user.email})\n`);

  // 4. Run Optimization manually
  console.log("🧠 4. Triggering Optimization Engine...");
  const optimizeRes = await authenticatedClient.optimize.run({
    endpoint: '/api/gateway/private',
    issue: 'High latency detected during peak hours.'
  });
  if (optimizeRes.data.decision) {
    console.log(`✅ Optimization Decision: Action -> ${optimizeRes.data.decision.action}, Reason -> ${optimizeRes.data.decision.reason}\n`);
  } else {
    console.log(`✅ Optimization Message: ${optimizeRes.data.message}\n`);
  }

  // 5. Fetch Metrics
  console.log("📊 5. Fetching Metrics...");
  const metricsRes = await authenticatedClient.metrics.list();
  console.log(`✅ Retrieved ${metricsRes.data.length} metric points.\n`);

  // 6. Fetch Decisions
  console.log("🤖 6. Fetching AI Decisions...");
  const decisionsRes = await authenticatedClient.decisions.list();
  console.log(`✅ Retrieved ${decisionsRes.data.length} past decisions.\n`);

  console.log("🎉 Demo completed successfully!");
}

main().catch(err => {
  console.error("❌ Demo failed:");
  console.error(err);
});
