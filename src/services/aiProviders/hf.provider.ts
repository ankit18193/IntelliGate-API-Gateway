import axios, { AxiosError } from "axios";
import { AIInput } from "../aiDataFormatter.service";
import { Suggestion } from "../ruleEngine.service";


interface HFChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}


const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct";


const HF_URL = `https://router.huggingface.co/v1/chat/completions`;


const buildPrompt = (data: AIInput): string => {
  return `
You are a backend optimization expert.

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

Return short, practical suggestions.
`;
};


export const hfProvider = async (
  data: AIInput
): Promise<Suggestion[]> => {
  console.log(`🧠 HF → Model: ${HF_MODEL}`);

  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    throw new Error("HF_API_KEY missing");
  }

  try {
    const response = await axios.post<HFChatResponse>(
      HF_URL,
      {
        
        model: HF_MODEL,
        messages: [
          {
            role: "user",
            content: buildPrompt(data),
          },
        ],
        temperature: 0.3,
        max_tokens: 200, 
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        
        timeout: 15000, 
      }
    );

    
    const text = response.data.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from HuggingFace");
    }

    console.log("HF success");

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
      console.error(" HF Axios Error");
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
    } else if (error instanceof Error) {
      console.error(" HF Error:", error.message);
    } else {
      console.error(" Unknown HF Error:", error);
    }

    throw error; 
  }
};