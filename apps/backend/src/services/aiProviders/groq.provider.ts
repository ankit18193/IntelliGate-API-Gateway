import axios, { AxiosError } from "axios";
import { AIInput } from "../aiDataFormatter.service";
import { Suggestion } from "../ruleEngine.service";


interface GroqResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}


const buildPrompt = (data: AIInput): string => {
  return `
You are a backend optimization expert.

Analyze the following API performance data and give clear, actionable suggestions.

Endpoint: ${data.endpoint}
Average Latency: ${data.avgLatency} ms
Error Rate: ${data.errorRate} %
Requests: ${data.requests}
Cache Hit Rate: ${data.cacheHitRate} %

Focus on:
- performance improvements
- caching strategies
- scaling recommendations
- error reduction

Return concise suggestions.
`;
};


export const groqProvider = async (data: AIInput): Promise<Suggestion[]> => {
  console.log("Trying GROQ (REAL API)...");

  const apiKey = process.env.GROQ_API_KEY;

 
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in environment variables");
  }

  try {
    const response = await axios.post<GroqResponse>(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        temperature: 0.3, 
        messages: [
          {
            role: "system",
            content:
              "You are a backend optimization assistant. Be precise and practical.",
          },
          {
            role: "user",
            content: buildPrompt(data),
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 4000, 
      },
    );

    const aiText = response.data?.choices?.[0]?.message?.content?.trim();

   
    if (!aiText) {
      throw new Error("Empty response from Groq");
    }

    return [
      {
        endpoint: data.endpoint,
        issue: "AI Optimization Insight",
        suggestion: aiText,
        priority: "Medium",

        
        category: "performance",
        source: "ai",
        createdAt: new Date(),
      },
    ];
  } catch (error: unknown) {
    
    if (error instanceof AxiosError) {
      console.error(" Groq Axios Error:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
    } else if (error instanceof Error) {
      console.error(" Groq Error:", error.message);
    } else {
      console.error(" Unknown Groq Error:", error);
    }

    throw error; 
  }
};
