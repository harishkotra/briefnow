import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchNews, scrapeArticle } from './mcpClient.js';
import { processArticles } from './scrapeService.js';
import { generateBrief } from './summarizeService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../ui')));

app.get('/api/brief-stream', async (req, res) => {
    const topic = req.query.topic;

    console.log(`Received request: Topic="${topic}"`);

    // SSE Setup
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const sendEvent = (type, payload) => {
        res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
    };

    try {
        if (!topic) {
            throw new Error("Topic is required");
        }

        let bundledContent;

        // STEP 1: Search
        sendEvent('log', 'Step 1: Searching global news sources via Bright Data...');

        // Add "latest news" to query if not present
        const query = `${topic} latest news`;
        let searchResults = await searchNews(query);

        // Normalize search results
        if (!Array.isArray(searchResults)) {
            // Try to normalize if it's not array (e.g. object from JSON)
            if (searchResults.organic) searchResults = searchResults.organic;
            else if (searchResults.items) searchResults = searchResults.items;
            else {
                // Last resort: if it's text, try to regex links?
                // Relying on mcpClient.js best effort json parse.
                searchResults = [];
            }
        }

        sendEvent('log', `Found ${searchResults.length} articles.`);

        if (searchResults.length === 0) {
            throw new Error("No search results found. Please check your API Token and network connection.");
        }

        sendEvent('log', `Scraping content from top results...`);
        bundledContent = await processArticles(searchResults, 4);

        if (!bundledContent || bundledContent.length < 50) {
            sendEvent('log', 'Warning: Scraped content is scanty.');
        } else {
            sendEvent('log', 'Content acquired and processed.');
        }

        // STEP 3: Summarize
        sendEvent('log', 'Step 3: Generating Executive Brief with Ollama...');

        // Heartbeat to keep connection alive (silent ping)
        const heartbeat = setInterval(() => {
            sendEvent('ping', 'keep-alive');
        }, 5000);

        let brief;
        try {
            brief = await generateBrief(bundledContent);
        } finally {
            clearInterval(heartbeat);
        }

        sendEvent('result', { brief, sources: searchResults.slice(0, 4) });
        sendEvent('done', 'Process Complete.');

    } catch (error) {
        console.error("Pipeline Error:", error);
        sendEvent('error', error.message);
    } finally {
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
