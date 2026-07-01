import { IProvider, Analysis, ProviderResponse } from '@intelligate/shared';

declare class GroqProviderAdapter implements IProvider {
    private readonly legacyProviderFn;
    readonly id = "groq";
    readonly name = "Groq";
    constructor(legacyProviderFn: (data: any) => Promise<any>);
    generateInsight(prompt: string, context: Analysis): Promise<ProviderResponse>;
}

declare class GeminiProviderAdapter implements IProvider {
    private readonly legacyProviderFn;
    readonly id = "gemini";
    readonly name = "Gemini";
    constructor(legacyProviderFn: (data: any) => Promise<any>);
    generateInsight(prompt: string, context: Analysis): Promise<ProviderResponse>;
}

declare class HFProviderAdapter implements IProvider {
    private readonly legacyProviderFn;
    readonly id = "huggingface";
    readonly name = "HuggingFace";
    constructor(legacyProviderFn: (data: any) => Promise<any>);
    generateInsight(prompt: string, context: Analysis): Promise<ProviderResponse>;
}

export { GeminiProviderAdapter, GroqProviderAdapter, HFProviderAdapter };
