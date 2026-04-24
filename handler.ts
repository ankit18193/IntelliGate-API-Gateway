import swaggerUi from "swagger-ui-dist";
import fs from "fs";
import path from "path";
import serverless from "serverless-http";
import express, {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { NextRequest } from "next/server";


import { swaggerSpec } from "./src/lib/swagger";

const app = express();
app.use(express.json());


app.get("/", (_req: ExpressRequest, res: ExpressResponse) => {
  res.redirect("/docs");
});

app.get("/docs", (req: ExpressRequest, res: ExpressResponse) => {
  
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>IntelliGate API Docs</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function () {
          const ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerSpec)}, 
            dom_id: "#swagger-ui",
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout",
            deepLinking: true,
            docExpansion: "list",
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2
          });
          window.ui = ui;
        };
      </script>
    </body>
  </html>
  `;

  res.status(200);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.send(html);
});


app.use(async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
  try {
    const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = req.headers.host || "localhost";
    const fullUrl = `${protocol}://${host}${req.url}`;
    const pathname = new URL(fullUrl).pathname;
    const method = req.method.toUpperCase();

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((val) => headers.append(key, val));
      }
    });

    const requestInit: RequestInit = { method, headers };

    if (method !== "GET" && method !== "HEAD") {
      if (req.body) {
        requestInit.body =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
    }

    const request = new NextRequest(fullUrl, requestInit);
    let response: Response;

    

   

if (pathname.endsWith("/api/docs")) {
  const { GET: docsGET } = await import("./src/app/api/docs/route");
  response = await docsGET(request);
} 


else if (pathname.endsWith("/api/auth/login")) {
  const { POST: authPOST } = await import("./src/app/api/auth/login/route");
  if (method !== "POST") return send405(res, method);
  response = await authPOST(request);
} 


else if (pathname.endsWith("/api/metrics")) {
  const { GET: metricsGET } = await import("./src/app/api/metrics/route");
  if (method !== "GET") return send405(res, method);
  response = await metricsGET(request);
} 


else if (pathname.endsWith("/api/dev/flush")) {
  const { POST: flushPOST } = await import("./src/app/api/dev/flush/route");
  if (method !== "POST") return send405(res, method);
  response = await flushPOST(request);
}


else if (pathname.endsWith("/api/optimize/run")) {
  const { POST: optimizePOST } = await import("./src/app/api/optimize/run/route");
  if (method !== "POST") return send405(res, method);
  response = await optimizePOST(request);
}
else if (pathname.endsWith("/api/decisions")) {
      const { GET: decisionsGET } = await import("./src/app/api/decisions/route");
      if (method !== "GET") return send405(res, method);
      response = await decisionsGET(request);
    }


else if (pathname.endsWith("/api/auth/register")) {
  const { POST: registerPOST } = await import("./src/app/api/auth/register/route");
  if (method !== "POST") return send405(res, method);
  response = await registerPOST(request);
}    


else {
  const { GET: gatewayGET } = await import("./src/app/api/gateway/[...route]/route");
  if (method !== "GET") return send405(res, method);
  response = await gatewayGET(request);
}

   
    const body = await response.text();

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(body);

  } catch (error: unknown) {
    console.error("Lambda Execution Error:", error);

    res.status(500).json({
      success: false,
      error: {
        message: "Internal Server Error (Lambda Gateway)",
        code: 500,
      },
    });
  }
});


function send405(res: ExpressResponse, method: string): void {
  res.status(405).json({
    success: false,
    error: {
      message: `Method ${method} Not Allowed`,
      code: 405,
    },
  });
}

export const main = serverless(app);