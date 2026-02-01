import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";

dotenv.config();

let client;
let transport;

export async function initMCP() {
  if (client) return client;

  transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@brightdata/mcp"],
    env: {
      API_TOKEN: process.env.BRIGHT_DATA_API_TOKEN,
      PATH: process.env.PATH // Propagate PATH so npx works
    }
  });

  client = new Client({
    name: "news-brief-backend",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  await client.connect(transport);
  console.log("Connected to Bright Data MCP");
  return client;
}

export async function searchNews(query) {
    if (!client) await initMCP();
    
    // Using search_engine tool
    const result = await client.callTool({
        name: "search_engine",
        arguments: { query }
    });

    // Result is { content: [{ type: 'text', text: '...' }] }
    // We expect the text to be JSON or a string list. 
    // BrightData's search usually returns a JSON string representing the search results.
    const text = result.content[0].text;
    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("Search result was not JSON, returning raw text lines");
        // Fallback: if it's just lines, wrap in object
        return text.split('\n').filter(l => l.trim()).map(l => ({ title: l, link: l })); // simplified
    }
}

export async function scrapeArticle(url) {
    if (!client) await initMCP();
    
    try {
        const result = await client.callTool({
            name: "scrape_as_markdown",
            arguments: { url }
        });
        
        return result.content[0].text;
    } catch (error) {
        console.error(`Failed to scrape ${url}:`, error.message);
        return null;
    }
}
