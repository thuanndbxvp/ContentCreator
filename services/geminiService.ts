import { GoogleGenAI, Type } from "@google/genai";
import type { GenerationParams, VisualPrompt, AllVisualPromptsResult } from '../types';

// Helper function to get the API client instance
const getApiClient = (): GoogleGenAI => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
        throw new Error("Chưa có API Key. Vui lòng thêm API Key của bạn trong phần Cài đặt (biểu tượng bánh răng).");
    }
    try {
        return new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Error initializing GoogleGenAI:", e);
        throw new Error("Lỗi khởi tạo AI Client. API Key có thể không hợp lệ.");
    }
}

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        // A simple, fast, and low-token request to check validity.
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'test',
        });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};

export const generateScript = async (params: GenerationParams): Promise<string> => {
    const { topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts } = params;
    const { tone, style, voice } = styleOptions;
    const { headings, bullets, bold, includeIntro, includeOutro } = formattingOptions;

    const language = targetAudience;

    const scriptPartsInstruction = scriptParts === 'Auto'
        ? "Structure the script into a logical number of main parts based on the topic and content flow."
        : `Structure the script into ${scriptParts} main parts. If the number of parts is 1, create a continuous flow.`;

    const prompt = `
      You are an expert YouTube scriptwriter. Your task is to generate a compelling and well-structured video script in ${language}.
      **Primary Goal:** Create a script about "${topic}".
      **Target Audience & Language:** The script must be written in ${language} and should be culturally relevant for this audience.
      **Script Structure & Length:**
      - **Total Word Count:** Aim for approximately ${wordCount || '800'} words.
      - **Script Parts:** ${scriptPartsInstruction}
      - **Introduction:** ${includeIntro ? "Include a captivating introduction to hook the viewer." : "Do not write a separate introduction."}
      - **Outro:** ${includeOutro ? "Include a concluding outro with a call-to-action." : "Do not write a separate outro."}
      **AI Writing Style Guide:**
      - **Tone:** ${tone}. The script should feel ${tone.toLowerCase()}.
      - **Style:** ${style}. Structure the content in a ${style.toLowerCase()} manner.
      - **Voice:** ${voice}. The narrator's personality should be ${voice.toLowerCase()}.
      **Crucial Instruction:** Ensure all parts of the script are well-connected, flow logically, and maintain a consistent narrative throughout.
      **Keywords:** If provided, naturally integrate the following keywords: "${keywords || 'None'}".
      **Formatting Instructions:**
      - ${headings ? "Use clear headings and subheadings for different sections (e.g., Intro, Main Point 1, Outro)." : "Do not use special headings."}
      - ${bullets ? "Use bullet points or numbered lists for easy-to-digest information where appropriate." : "Do not use lists."}
      - ${bold ? "Use markdown for bold (**text**) or italics (*text*) to emphasize key phrases or points." : "Do not use bold or italics."}
      Please generate the complete video script now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating script from Gemini API:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tạo kịch bản. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const generateScriptOutline = async (topic: string, wordCount: string, language: string): Promise<string> => {
    const prompt = `
        You are an expert YouTube scriptwriter and content strategist.
        Your task is to generate a detailed and well-structured outline for a long-form YouTube video.
        **Primary Topic:** "${topic}"
        **Target Language:** ${language}
        **Target Script Length:** Approximately ${wordCount} words.
        **Instructions:**
        1.  Create a comprehensive outline that breaks the topic down into a logical sequence (e.g., Introduction, Part 1, Part 2, ..., Conclusion).
        2.  For each main part, include key talking points, sub-topics, or questions that should be answered.
        3.  The structure should be clear and easy to follow, serving as a roadmap for writing the full script later.
        4.  Ensure the outline is detailed enough to guide the creation of a script that meets the target word count.
        5.  The entire response should be in ${language}. Use markdown headings starting from ## for parts.
        **Output Format:** Provide ONLY the outline, using markdown for headings, subheadings, and bullet points for clarity. Start directly with the outline.
        Example:
        ## I. Mở Đầu (Intro)
        -   Gây ấn tượng mạnh, nêu ra câu hỏi trung tâm.
        -   Giới thiệu ngắn gọn về chủ đề và tầm quan trọng của nó.
        -   Hứa hẹn giá trị mà người xem sẽ nhận được.
        ---
        Now, please generate the outline for the specified topic.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const userGuide = `### Dàn Ý Chi Tiết Cho Kịch Bản Dài\n\n**Gợi ý:** Kịch bản của bạn dài hơn 1000 từ. Đây là dàn ý chi tiết AI đã tạo ra. Bạn có thể sử dụng nút "Tạo kịch bản đầy đủ" bên dưới để AI tự động viết từng phần cho bạn.\n\n---\n\n`;
        return userGuide + response.text;
    } catch (error) {
        console.error("Error generating script outline from Gemini API:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tạo dàn ý. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const generateTopicSuggestions = async (theme: string): Promise<string[]> => {
    if (!theme.trim()) return [];
    const prompt = `Based on the central theme "${theme}", generate exactly 10 specific, engaging, and SEO-friendly YouTube video titles in Vietnamese. The titles should be diverse and cover different angles of the theme.`;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            description: "A list of 10 video topic suggestions.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['suggestions']
                 }
             }
        });
        
        const jsonResponse = JSON.parse(response.text);
        const suggestions: string[] = jsonResponse.suggestions;
        if (!Array.isArray(suggestions) || suggestions.some(s => typeof s !== 'string')) {
             throw new Error("AI returned data in an unexpected format.");
        }
        return suggestions;

    } catch (error) {
        console.error("Error generating topic suggestions from Gemini API:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tạo gợi ý chủ đề. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const generateKeywordSuggestions = async (topic: string): Promise<string[]> => {
    if (!topic.trim()) return [];
    const prompt = `Based on the central video topic "${topic}", generate at least 5 relevant, SEO-friendly keywords. The keywords should be in Vietnamese.`;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        keywords: {
                            type: Type.ARRAY,
                            description: "A list of at least 5 relevant keywords.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['keywords']
                 }
             }
        });
        
        const jsonResponse = JSON.parse(response.text);
        const keywords: string[] = jsonResponse.keywords;
        if (!Array.isArray(keywords) || keywords.some(s => typeof s !== 'string')) {
             throw new Error("AI returned data in an unexpected format.");
        }
        return keywords;

    } catch (error) {
        console.error("Error generating keyword suggestions from Gemini API:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tạo gợi ý từ khóa. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const reviseScript = async (originalScript: string, revisionInstruction: string, params: GenerationParams): Promise<string> => {
    const { targetAudience, styleOptions } = params;
    const { tone, style, voice } = styleOptions;
    const language = targetAudience;
    const prompt = `
      You are an expert YouTube script editor. Your task is to revise the following script based on the user's instructions.
      **Original Script:**
      """
      ${originalScript}
      """
      **User's Revision Request:**
      "${revisionInstruction}"
      **Instructions:**
      - Apply the requested changes while maintaining the original tone, style, and voice: Tone: ${tone}, Style: ${style}, Voice: ${voice}.
      - The script must remain coherent and flow naturally. The revision must integrate seamlessly.
      - The language must remain ${language}.
      - The output should be the FULL, revised script, not just the changed parts. Adhere to the original formatting guidelines.
      - Start directly with the revised script content.
      Please provide the revised script now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error revising script:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể sửa kịch bản. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const generateScriptPart = async (fullOutline: string, previousPartsScript: string, currentPartOutline: string, params: Omit<GenerationParams, 'topic'>): Promise<string> => {
    const { targetAudience, styleOptions, keywords, formattingOptions } = params;
    const { tone, style, voice } = styleOptions;
    const { headings, bullets, bold } = formattingOptions;
    const language = targetAudience;
    const prompt = `
      You are an expert YouTube scriptwriter continuing the creation of a video script. You must ensure seamless transitions and maintain a consistent narrative flow.
      **Overall Video Outline:**
      """
      ${fullOutline}
      """
      **Script Generated So Far (for context only, do not repeat):**
      """
      ${previousPartsScript}
      """
      **Your Current Task:** Write the script for the next section based on this part of the outline:
      """
      ${currentPartOutline}
      """
      **Instructions:**
      - Write ONLY the script for the current part described in the task.
      - **Crucial:** Ensure the beginning of this part connects smoothly with the end of the previously generated script.
      - Strictly adhere to the established style guide: Tone: ${tone}, Style: ${style}, Voice: ${voice}.
      - The language must remain ${language}.
      - If provided, naturally integrate these keywords: "${keywords || 'None'}".
      - Formatting: ${headings ? "Use headings if needed." : ""} ${bullets ? "Use lists if needed." : ""} ${bold ? "Use bold/italics if needed." : ""}
      - The final output should be ONLY the text for the current part, starting directly with its content (including its heading from the outline).
      Generate the script for the current part now.
    `;
    
    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating script part:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tạo phần tiếp theo của kịch bản. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const extractDialogue = async (script: string, language: string): Promise<string> => {
    const prompt = `
      You are an AI assistant specializing in processing video scripts for Text-to-Speech (TTS) generation.
      Your task is to analyze the following YouTube script and extract ONLY the parts meant to be spoken aloud by the narrator or voice actor.
      **Input Script:**
      """
      ${script}
      """
      **Instructions:**
      1.  **Extract Spoken Text Only:** Read through the entire script and pull out only the dialogue or narration.
      2.  **Remove Non-Spoken Elements:** You MUST remove all of the following:
          -   Headings and subheadings (e.g., "## Mở Đầu", "### Phần 1: ...").
          -   Formatting instructions or scene descriptions in brackets (e.g., "[upbeat music]", "[show graphic of a planet]", "[pause for effect]").
          -   Markdown formatting like asterisks for bold/italics.
          -   Any comments or notes for the editor or creator.
          -   Section separators like "---".
      3.  **Format for TTS:** The output should be a single, clean block of text. Paragraph breaks should be preserved to allow for natural pacing in the TTS output.
      4.  **Language:** The output must be in the original language of the script, which is ${language}.
      Please provide the clean, TTS-ready dialogue now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error extracting dialogue:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tách lời thoại. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const generateVisualPrompt = async (sceneDescription: string): Promise<VisualPrompt> => {
    const prompt = `
        You are a visual director. Based on the following script scene, create a concise, descriptive, and evocative prompt in English for an AI image or video generator (like Veo or Flow).
        The prompt should focus on visual elements: setting, characters, actions, mood, and camera style.
        Also, provide a Vietnamese translation for the prompt.
        Output ONLY a JSON object with two keys: "english" and "vietnamese".

        **Script Scene:**
        """
        ${sceneDescription}
        """
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        english: {
                            type: Type.STRING,
                            description: "The visual prompt in English."
                        },
                        vietnamese: {
                            type: Type.STRING,
                            description: "The Vietnamese translation of the prompt."
                        }
                    },
                    required: ["english", "vietnamese"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        if (typeof jsonResponse.english === 'string' && typeof jsonResponse.vietnamese === 'string') {
            return jsonResponse;
        } else {
            throw new Error("AI returned data in an unexpected format.");
        }
    } catch (error) {
        console.error("Error generating visual prompt:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tạo prompt hình ảnh. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};

export const generateAllVisualPrompts = async (script: string): Promise<AllVisualPromptsResult[]> => {
    const prompt = `
        You are a visual director AI. Your task is to analyze the following YouTube script, which is divided into sections by markdown headings (## or ###), and generate a concise, descriptive visual prompt in English for an AI image/video generator for EACH section. Also provide a Vietnamese translation for each prompt.

        **Input Script:**
        """
        ${script}
        """

        **Instructions:**
        1. Identify each distinct section/scene in the script, using the markdown headings as delimiters.
        2. For each section, create one visual prompt.
        3. The prompt should focus on visual elements: setting, characters, actions, mood, and camera style.
        4. The final output must be a JSON array. Each element in the array should be an object with three keys: "scene" (containing the original text of the script section), "english" (the English prompt), and "vietnamese" (the Vietnamese translation).
        
        Please generate the JSON array now.
    `;

    try {
        const ai = getApiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            scene: {
                                type: Type.STRING,
                                description: 'The original text of the script scene/section.'
                            },
                            english: {
                                type: Type.STRING,
                                description: 'The visual prompt in English.'
                            },
                            vietnamese: {
                                type: Type.STRING,
                                description: 'The Vietnamese translation of the prompt.'
                            }
                        },
                        required: ['scene', 'english', 'vietnamese']
                    }
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        if (Array.isArray(jsonResponse)) {
            // Further validation can be added here if needed
            return jsonResponse as AllVisualPromptsResult[];
        } else {
            throw new Error("AI returned data in an unexpected format.");
        }
    } catch (error) {
        console.error("Error generating all visual prompts:", error);
        if (error instanceof Error && error.message.includes("API Key")) {
             throw error;
        }
        throw new Error("Không thể tạo prompt hàng loạt. Dịch vụ AI có thể không khả dụng hoặc API Key không hợp lệ.");
    }
};
