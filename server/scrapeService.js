import { scrapeArticle } from './mcpClient.js';

const WORD_LIMIT = 1000;

function trimContent(text, limit) {
    const words = text.split(/\s+/);
    if (words.length > limit) {
        return words.slice(0, limit).join(' ') + '... [TRUNCATED]';
    }
    return text;
}

function cleanMarkdown(text) {
    // Remove common cookie warnings or nav text if identifiable
    // For now, basic cleanup of excessive newlines
    return text.replace(/\n{3,}/g, '\n\n');
}

export async function processArticles(searchResults, maxArticles = 3) {
    const bundledContent = [];
    let successfulScrapes = 0;

    // Assuming searchResults is an array of objects with link/url and title
    // Depending on what 'search_engine' returns exactly. 
    // We'll try to iterate common logical formats.
    const items = Array.isArray(searchResults) ? searchResults : [];

    for (const item of items) {
        if (successfulScrapes >= maxArticles) break;

        const url = item.link || item.url;
        if (!url) continue;

        console.log(`Scraping: ${url}`);

        // Safety: skip paywalled or known difficult domains (simple heuristic)
        if (url.includes('wsj.com') || url.includes('ft.com')) {
            console.log(`Skipping likely paywall: ${url}`);
            continue;
        }

        try {
            const rawMarkdown = await scrapeArticle(url);

            if (rawMarkdown && rawMarkdown.length > 200) { // Minimal length check
                const cleaned = cleanMarkdown(rawMarkdown);
                const trimmed = trimContent(cleaned, WORD_LIMIT);

                bundledContent.push(
                    `SOURCE: ${url}\nTITLE: ${item.title || 'Unknown'}\nCONTENT:\n${trimmed}\n`
                );
                successfulScrapes++;
            }
        } catch (e) {
            console.error(`Error processing ${url}:`, e);
        }
    }

    return bundledContent.join('\n---\n');
}
