import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

const PROMPT_TEMPLATE = `You are an executive intelligence analyst.

Create a 60-second executive briefing from the news extracts below.

STRICT OUTPUT FORMAT (Markdown):

### EXECUTIVE BRIEF
(One paragraph summary)

### KEY DEVELOPMENTS
* (Bullet point)
* (Bullet point)

### RISKS
* (Bullet point)

### OPPORTUNITIES
* (Bullet point)

### STRATEGIC IMPACT
* (Bullet point)

### SIGNAL STRENGTH
(Select one: **High**, **Medium**, or **Low**)

INSTRUCTIONS:
- Use H3 headers (###) for sections.
- Use standard bullets (*).
- Be concise. No filler.
- Only decision-useful information.
- For SIGNAL STRENGTH, ensure you select ONLY ONE value.

NEWS DATA:
{{SCRAPED_CONTENT}}`;

export async function generateBrief(scrapedContent) {
    if (!scrapedContent) return "No content available to summarize.";

    const prompt = PROMPT_TEMPLATE.replace('{{SCRAPED_CONTENT}}', scrapedContent);

    try {
        console.log(`Sending request to Ollama (${OLLAMA_MODEL})...`);

        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.2 // Low temp for factual analysis
            },
            timeout: 180000 // 3 minute timeout
        });

        if (response.data && response.data.response) {
            return response.data.response;
        } else {
            throw new Error("Invalid response from Ollama");
        }

    } catch (error) {
        console.error("Ollama API Error:", error.message);
        if (error.code === 'ECONNREFUSED') {
            return "Error: Could not connect to Ollama. Please ensure Ollama is running (ollama serve).";
        }
        return `Error generating brief: ${error.message}`;
    }
}
