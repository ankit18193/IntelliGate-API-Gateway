# Interview Guide

This document maps engineering concepts demonstrated in IntelliGate to common Senior Software Engineer interview questions.

## Q: How do you decouple infrastructure from business logic?
**A**: "In IntelliGate, I used Clean Architecture. I extracted the Core Engine into an isolated package that only depends on interfaces (`IMetricsStore`, `IProvider`). The actual implementations (Redis, Groq) are separate packages injected at runtime. This means the core business rules are completely agnostic to the database or AI provider."

## Q: How do you ensure SDKs are resilient?
**A**: "I built the IntelliGate SDK Transport layer with built-in exponential backoff for 429/5xx errors, and used AbortControllers to enforce strict timeouts, preventing hanging sockets. Furthermore, I decoupled the business resources (`GatewayResource`) from the `fetch` logic using an abstract `APIResource`."

## Q: How do you handle high-throughput telemetry?
**A**: "To avoid blocking the main proxy thread, I used an asynchronous background queue for telemetry. When a request hits the gateway, it's proxied immediately. In the background, metrics are pushed to a processing queue where an AI model analyzes the traffic patterns asynchronously without impacting user latency."
