const topicInput = document.getElementById('topicInput');
const generateBtn = document.getElementById('generateBtn');

const progressContainer = document.getElementById('progress-container');
const resultContainer = document.getElementById('result-container');
const briefContent = document.getElementById('briefContent');
const sourcesList = document.getElementById('sourcesList');
const briefDate = document.getElementById('briefDate');

generateBtn.addEventListener('click', startGeneration);

function startGeneration() {
    const topic = topicInput.value.trim();
    if (!topic) return alert('Please enter a topic');

    // UI Reset
    generateBtn.disabled = true;
    generateBtn.textContent = 'Agent Working...';
    progressContainer.style.display = 'block';
    progressContainer.innerHTML = '';
    resultContainer.style.display = 'none';

    // Connect to SSE
    const evtSource = new EventSource(`/api/brief-stream?topic=${encodeURIComponent(topic)}`);

    let lastLogEntry = null;

    evtSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.type === 'log') {
            // Remove loading from previous
            if (lastLogEntry) lastLogEntry.classList.remove('loading');

            const logItem = document.createElement('div');
            logItem.className = 'log-entry loading'; // New item is loading
            logItem.textContent = `> ${data.payload}`;
            progressContainer.appendChild(logItem);
            progressContainer.scrollTop = progressContainer.scrollHeight;

            lastLogEntry = logItem;
        }
        else if (data.type === 'result') {
            renderBrief(data.payload);
        }
        else if (data.type === 'done') {
            if (lastLogEntry) lastLogEntry.classList.remove('loading');
            evtSource.close();
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Brief';
        }
        else if (data.type === 'error') {
            if (lastLogEntry) lastLogEntry.classList.remove('loading');
            evtSource.close();
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Brief';
            alert('Error: ' + data.payload);
            const errorLog = document.createElement('div');
            errorLog.style.color = 'red';
            errorLog.textContent = `ERROR: ${data.payload}`;
            progressContainer.appendChild(errorLog);
        }
    };

    evtSource.onerror = function (err) {
        if (lastLogEntry) lastLogEntry.classList.remove('loading');
        console.error("EventSource failed:", err);
        evtSource.close();
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Brief';
    };
}

// Share as Image
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', shareAsImage);

async function shareAsImage() {
    const briefCard = document.querySelector('.brief-card');
    const originalText = shareBtn.textContent;

    shareBtn.textContent = 'Capturing...';
    shareBtn.disabled = true;

    try {
        const canvas = await html2canvas(briefCard, {
            scale: 2, // Higher resolution
            backgroundColor: '#ffffff', // Ensure white background
            ignoreElements: (element) => element.id === 'shareBtn' // Don't include the button itself
        });

        canvas.toBlob(async (blob) => {
            try {
                // Clipboard API for images
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                shareBtn.textContent = 'Copied to Clipboard!';
            } catch (err) {
                console.error('Clipboard write failed:', err);
                shareBtn.textContent = 'Failed';
                alert('Could not copy to clipboard. Please check browser permissions.');
            }

            // Reset button after delay
            setTimeout(() => {
                shareBtn.textContent = originalText;
                shareBtn.disabled = false;
            }, 3000);

        }, 'image/png');

    } catch (err) {
        console.error('Capture failed:', err);
        shareBtn.textContent = 'Error';
        setTimeout(() => {
            shareBtn.textContent = originalText;
            shareBtn.disabled = false;
        }, 3000);
    }
}

function renderBrief(data) {
    const { brief, sources } = data;

    // Render Markdown
    briefContent.innerHTML = marked.parse(brief);

    // Render Sources
    sourcesList.innerHTML = '';
    sources.forEach(source => {
        const link = document.createElement('a');
        link.href = source.link || source.url; // Handle various key names
        link.className = 'source-tag';
        link.target = '_blank';
        link.textContent = source.title ? (source.title.substring(0, 30) + '...') : (new URL(link.href).hostname);
        sourcesList.appendChild(link);
    });

    // Set Date
    briefDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Smooth scroll
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });

    // Save to History (if not just re-rendering)
    if (!data.fromHistory) {
        saveToHistory(
            document.getElementById('topicInput').value.trim(),
            brief,
            sources
        );
    }
}

// History Management
const HISTORY_KEY = 'brief_history_v1';
const historyContainer = document.getElementById('history-container');
const historyList = document.getElementById('historyList');

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    renderHistory(history);
}

function saveToHistory(topic, brief, sources) {
    if (!topic || !brief) return;

    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

    // Remove if duplicate topic exists (move to top)
    const existingIndex = history.findIndex(h => h.topic.toLowerCase() === topic.toLowerCase());
    if (existingIndex > -1) {
        history.splice(existingIndex, 1);
    }

    // Add new item
    const newItem = {
        id: Date.now(),
        topic: topic,
        brief: brief,
        sources: sources,
        timestamp: new Date().toISOString()
    };

    history.unshift(newItem);

    // Keep max 10 items
    if (history.length > 10) history.pop();

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory(history);
}

function renderHistory(history) {
    if (history.length === 0) {
        historyContainer.style.display = 'none';
        return;
    }

    historyContainer.style.display = 'block';
    historyList.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <span>${item.topic}</span>
            <span class="history-time">${new Date(item.timestamp).toLocaleDateString()}</span>
        `;
        div.onclick = () => loadHistoryItem(item);
        historyList.appendChild(div);
    });
}

function loadHistoryItem(item) {
    topicInput.value = item.topic;
    renderBrief({
        brief: item.brief,
        sources: item.sources,
        fromHistory: true
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadHistory);
