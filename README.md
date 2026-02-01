# Real-Time News Executive Brief Generator

An agentic AI application that researches live news and generates concise executive briefings using Bright Data MCP and Ollama.

## 🚀 Features
- **Real-Time Web Search**: Finds the latest news on any topic.
- **Smart Scraping**: Extracts main content, removing clutter.
- **Executive Summaries**: condensed headers, bullets, and signal strength.
- **Local Privacy**: Summarization happens locally via Ollama.
- **Agent Loop**: Watch the agent search, scrape, and analyze in real-time.

## 🧱 Tech Stack
- **Node.js & Express**: Backend API & Server.
- **Bright Data MCP**: Search & Scraping capabilities.
- **Ollama**: Local LLM for summarization (Llama 3 recommended).
- **Vanilla JS**: Lightweight, fast UI.

## 🛠️ Setup

### 1. Prerequisites
- Node.js (v18+)
- [Ollama](https://ollama.com/) installed and running.
- A [Bright Data](https://brightdata.com/) account (for API Token).

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=3000
BRIGHT_DATA_API_TOKEN=your_bright_data_token_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 4. Setup Ollama
Pull the model you want to use (ensure `OLLAMA_MODEL` matches this):
```bash
ollama pull llama3
```
Ensure Ollama is running:
```bash
ollama serve
```

## 🏃 Usage

### Start the Server
```bash
npm start
```

### Generate a Brief
1. Open `http://localhost:3000` in your browser.
2. Enter a topic (e.g., "Nvidia antitrust news").
3. Click **Generate Brief**.
4. Watch the agent work!

### Demo Mode
Check the **Demo Mode** box to see the UI flow with mock data (no API credits or LLM inference required).

## 🧩 Project Structure
- `server/mcpClient.js`: Connects to Bright Data MCP.
- `server/scrapeService.js`: Filters and formats article content.
- `server/summarizeService.js`: Sends prompts to Ollama.
- `ui/`: Frontend assets.
