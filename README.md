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

### Output

<img width="977" height="668" alt="Screenshot at Feb 01 10-52-18" src="https://github.com/user-attachments/assets/ccde5846-5af4-43f8-92d8-93a0f6fba5f2" />
<img width="1314" height="954" alt="Screenshot at Feb 01 11-05-14" src="https://github.com/user-attachments/assets/c164630c-e724-4c42-b83d-37e7d6edd312" />
<img width="1158" height="830" alt="Screenshot at Feb 01 11-05-20" src="https://github.com/user-attachments/assets/ba5834d2-d1d9-4e0f-a72b-61c8b3e0761e" />
<img width="1282" height="1023" alt="Screenshot at Feb 01 11-05-47" src="https://github.com/user-attachments/assets/3d0fde03-d779-43fc-a399-33a5dddf9fa7" />
<img width="1173" height="931" alt="Screenshot at Feb 01 12-45-19" src="https://github.com/user-attachments/assets/22f2cb69-a6b1-4a42-98b1-406f27e3a2b1" />

<img width="2766" height="4316" alt="screencapture-localhost-3000-2026-02-01-17_10_21" src="https://github.com/user-attachments/assets/d7786597-1fe8-4e26-ad77-1687cdaeac04" />
<img width="2766" height="4086" alt="screencapture-localhost-3000-2026-02-01-17_09_14" src="https://github.com/user-attachments/assets/bf64802f-e4ff-4c11-9cbb-4926ffc4ab55" />


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
