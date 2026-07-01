import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "IntelliGate API Gateway",
      version: "1.0.0",
      description: `
🚀 AI-powered API Gateway with intelligent optimization.

🔥 Features:
- JWT Authentication
- Redis Caching & Rate Limiting
- MongoDB Metrics Tracking
- AI-based Optimization & Suggestions

🧠 Demo Credentials:
Use this to login:
{
  "email": "admin@test.com",
  "password": "1234"
}

🚀 Usage Flow:
1. Call /api/auth/login
2. Copy token from response
3. Click "Authorize" (top right)
4. Paste: Bearer <your_token>
5. Access protected routes

🤖 AI Insight:
- Visit /api/metrics
- Check "analysis" field in response
- This contains AI-generated optimization suggestions
      `,
    },

    servers: [
      {
        url: "https://jp5vmikp4c.execute-api.ap-south-1.amazonaws.com",
        description: "AWS Production Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
            meta: {
              type: "object",
              properties: {
                timestamp: { type: "string", example: "2026-04-23T12:00:00.000Z" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string", example: "Authorization header missing" },
                code: { type: "number", example: 401 },
              },
            },
          },
        },
        AIAnalysis: {
          type: "object",
          description: "AI-generated optimization insights",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string", example: "Enable caching for /api/gateway/private" },
            },
            riskLevel: { type: "string", example: "medium" },
            improvementScore: { type: "number", example: 78 },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],

    tags: [
      { name: "Auth", description: "Authentication APIs" },
      { name: "Gateway", description: "Core API Gateway routes" },
      { name: "Metrics", description: "System monitoring & analytics" },
      { name: "Optimization", description: "AI-based optimization layer" },
    ],

    
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register new user",
          description: "Creates a new user account with a securely hashed password.",
          security: [],   
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "test@example.com" },
                    password: { type: "string", example: "mysecurepassword123" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
            400: { description: "Missing fields" },
            409: { description: "User already exists" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "User Login",
          description: "Login to get JWT Token",
          security: [],  
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "admin@test.com" },
                    password: { type: "string", example: "1234" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Successful login", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          },
        },
      },
      "/api/gateway/public": {
        get: {
          tags: ["Gateway"],
          summary: "Public Gateway Route",
          security: [],  
          responses: {
            200: { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          },
        },
      },
      "/api/gateway/private": {
        get: {
          tags: ["Gateway"],
          summary: "Private Gateway Route",
          responses: {
            200: { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
      "/api/metrics": {
        get: {
          tags: ["Metrics"],
          summary: "System Metrics & AI Analysis",
          responses: {
            200: { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          },
        },
      },
      
      "/api/optimize/run": {
        post: {
          tags: ["Optimization"],
          summary: "Trigger Auto-Optimization Engine",
          description: "Analyzes recent metrics and automatically applies infrastructure optimizations.\n\n🤖 **Intelligence Flow**:\n1. **Observe**: Collects latest system metrics from MongoDB.\n2. **Analyze**: AI evaluates traffic, latency, and error rates.\n3. **Decide**: Rules engine maps AI insights to concrete system actions.\n4. **Act**: Executes live configuration changes.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Optimization cycle executed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          analysis: { 
                            type: "object", 
                            description: "AI generated insights",
                            example: { severity: "MEDIUM", signals: { highTraffic: true, slow: false } }
                          },
                          decisions: {
                            type: "object",
                            description: "Mapped system actions",
                            example: { action: "INCREASE_RATE_LIMIT", target: "/api/gateway/private", metadata: { increment: 20 } }
                          },
                          execution: {
                            type: "array",
                            description: "Results of applied optimizations",
                            example: [{ endpoint: "/api/gateway/private", action: "INCREASE_RATE_LIMIT", impact: "IMPROVED" }]
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: { description: "No metrics available to analyze", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            500: { description: "Optimization execution failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
          }
        }
      },
      "/api/decisions": {
        get: {
          tags: ["Optimization"],
          summary: "View optimization decision history",
          description: "Returns an audit trail of all actions executed by the AI engine, including its reasoning.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { 
              description: "Success", 
              content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } 
            },
          }
        }
      },
    },
  },
  
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);