
/**
 * server.js - Local Ollama proxy for CalmLeaf UI
 * - Sends conversation history to local Ollama endpoint at http://localhost:11434/api/generate
 * - Builds a single prompt string from messages (system / user / assistant)
 *
 * Usage:
 * 1. Install Ollama and run a model, e.g. `ollama run llama3.1` or `ollama run mistral`
 * 2. npm install
 * 3. node server.js
 *
 * Note: Ollama must be running on the same machine and listening on port 11434.
 */
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.1';
const PORT = process.env.PORT || 3000;

function buildPromptFromMessages(messages){
  // messages: [{role, content}, ...]
  // We'll create a simple concatenated prompt with role markers.
  const parts = [];
  messages.forEach(m=>{
    const role = (m.role||'user').toLowerCase();
    if(role === 'system') parts.push("[System]: " + m.content);
    else if(role === 'assistant') parts.push("[Assistant]: " + m.content);
    else parts.push("[User]: " + m.content);
  });
  // Add an assistant cue at the end
  parts.push("[Assistant]:");
  return parts.join("\n\n");
}

app.post('/api/generate', async (req, res) => {
  try {
    console.log('--- /api/generate called ---');
    const { messages } = req.body;
    if(!Array.isArray(messages)) return res.status(400).json({ error: 'messages must be an array' });

    const prompt = buildPromptFromMessages(messages);
    console.log('Prompt (truncated):', prompt.slice(0,2000));

    const endpoint = `${OLLAMA_HOST}/api/generate`;
    const payload = {
      model: MODEL,
      prompt: prompt,
      stream: false
    };

    console.log('Calling Ollama:', endpoint, 'model:', MODEL);
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('Upstream status:', r.status, r.statusText);
    const text = await r.text();
    console.log('Upstream response (truncated):', text.slice(0,4000));

    // Try to parse JSON
    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }

    // Attempt to extract a readable reply:
    let reply = '';
    if (data) {
      if (typeof data === 'string') reply = data;
      else if (data.output && typeof data.output === 'string') reply = data.output;
      else if (data.result && typeof data.result === 'string') reply = data.result;
      else if (data.response && typeof data.response === 'string') reply = data.response;
      else if (Array.isArray(data.output) && data.output.length) reply = data.output.map(o=> (o && o.text) ? o.text : JSON.stringify(o)).join('\n');
      else if (data.message && data.message.content) reply = data.message.content;
      else reply = JSON.stringify(data);
    } else {
      reply = 'No response';
    }

    res.json({ reply });
  } catch (err) {
    console.error('Error in /api/generate:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.listen(PORT, ()=> {
  console.log("\n=====================================");
  console.log("🌿 CalmLeaf (Ollama) — Local Mental Health Assistant");
  console.log("🚀 Server running at:");
  console.log(`👉 http://localhost:${PORT}`);
  console.log("=====================================\n");
});
