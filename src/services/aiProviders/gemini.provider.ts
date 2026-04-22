import axios, { AxiosError } from "axios";
import { AIInput } from "../aiDataFormatter.service";
import { Suggestion } from "../ruleEngine.service";


interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
}


export const geminiProvider = async (
  data: AIInput
): Promise<Suggestion[]> => {
  console.log("Trying Gemini (REAL API)...");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  
  const systemInstruction = 
    "You are a backend optimization expert. Return short, practical suggestions. Do not include markdown formatting like bolding or bullet points unless absolutely necessary.";

  const userPrompt = `
Analyze API performance data and give actionable suggestions.

Endpoint: ${data.endpoint}
Latency: ${data.avgLatency} ms
Error Rate: ${data.errorRate} %
Requests: ${data.requests}
Cache Hit Rate: ${data.cacheHitRate} %

Focus on:
- performance improvements
- caching strategies
- scaling recommendations
- error reduction
`;

  try {
    
    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200, 
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, 
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini");
    }

    console.log("Gemini success");

    return [
      {
        endpoint: data.endpoint,
        issue: "AI Optimization Insight",
        suggestion: text.trim(),
        priority: "Medium",
        category: "performance",
        source: "ai",
        createdAt: new Date(),
      },
    ];
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Gemini Axios Error:");
      console.error("Status:", error.response?.status);
      
      console.error("Data:", JSON.stringify(error.response?.data, null, 2)); 
    } else if (error instanceof Error) {
      console.error("Gemini Error:", error.message);
    } else {
      console.error("Unknown Gemini Error:", error);
    }

    throw error; 
  }
};