import { GoogleGenAI, Type } from "@google/genai";
import { PassageData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const passageSchema = {
    type: Type.OBJECT,
    properties: {
        passage: {
            type: Type.STRING,
            description: "The full passage text containing the 10 incomplete words with underscores."
        },
        words: {
            type: Type.ARRAY,
            description: "An array containing EXACTLY 10 objects, one for each incomplete word. The length of this array must be 10.",
            items: {
                type: Type.OBJECT,
                properties: {
                    incomplete: {
                        type: Type.STRING,
                        description: "The incomplete word as it appears in the passage (e.g., 'inves____')."
                    },
                    complete: {
                        type: Type.STRING,
                        description: "The full, correct spelling of the word (e.g., 'investigate')."
                    },
                },
                 required: ["incomplete", "complete"],
            },
        },
    },
    required: ["passage", "words"],
};


export const generatePassage = async (): Promise<PassageData> => {
    const prompt = `
You are an expert in creating educational content for TOEFL preparation. Your task is to generate a short, academic-style passage for a "Complete the Words" task.

Follow these rules STRICTLY:
1. The entire passage must be strictly between 80 and 90 words long.
2. The passage must read like a textbook or academic article excerpt, defining or explaining a concept from a field like biology, history, sociology, art history, or astronomy.
3. The passage and the 'words' array in the JSON output MUST contain exactly 10 incomplete words. Not 9, not 11, but precisely 10. This is a critical requirement.
4. For each of the 10 incomplete words, the second half of the word must be missing. For a word of length L, provide the first \`Math.ceil(L / 2)\` letters. The remaining letters must be replaced by underscores.
   - Example 1: For the word "research" (8 letters), the first half is 4 letters ('rese'). The incomplete form is "rese____".
   - Example 2: For the word "completion" (10 letters), the first half is 5 letters ('compl'). The incomplete form is "compl_____".
   - Example 3: For the word "analyze" (7 letters), the first half is 4 letters ('anal'). The incomplete form is "anal___".
5. The missing letters must be represented by underscores, with exactly one underscore per missing letter. This is critical for parsing. The incomplete word must be the given letters followed immediately by a single contiguous block of underscores.
6. All 10 incomplete words must appear ONLY in the second and/or third sentences of the passage. The first sentence must not contain any incomplete words.
7. The passage must be grammatically correct, coherent, and have a formal, academic tone suitable for a TOEFL exam.
8. Generate a completely new and independent passage on a different topic each time you are called. Do not reference previous generations.

Provide the output as a JSON object that strictly adheres to the provided schema. Do not add any text or markdown formatting before or after the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: passageSchema,
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        
        // Strict validation
        if (!data.passage || !Array.isArray(data.words) || data.words.length !== 10) {
            console.error("API did not return exactly 10 words. Word count:", data.words?.length);
            throw new Error("Invalid data structure received from API: The passage must contain exactly 10 incomplete words.");
        }

        return data as PassageData;

    } catch (error) {
        console.error("Error generating passage with Gemini:", error);
        throw new Error("Failed to generate a new passage. Please try again.");
    }
};