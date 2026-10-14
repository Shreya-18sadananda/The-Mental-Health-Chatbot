
# CalmLeaf (Ollama) — Local Mental Health Assistant

This project runs the same CalmLeaf frontend (neon dark UI) with a Node.js backend that talks to a locally running Ollama server.
No API keys required — Ollama runs the model locally on your machine.

## What you need
1. Install Ollama: https://ollama.com
2. Run a model locally, for example:
   ```
   ollama run llama3.1
   ```
   or
   ```
   ollama run mistral
   ```

3. Project setup
   - Extract this folder and open it in any code editor (VS Code, Sublime, or use terminal only)
   - Copy `.env.example` to `.env` and change values if needed

4. Install dependencies and start
   ```
   npm install
   npm start
   ```

5. Open in browser:
   ```
   http://localhost:3000
   ```

## If you don't use VS Code
You can run everything from the command prompt / PowerShell / Terminal.

Example (Windows PowerShell):
```
cd "C:\path\to\mental-health-ollama"
npm install
npm start
```

Example (macOS / Linux terminal):
```
cd ~/path/to/mental-health-ollama
npm install
npm start
```

## Troubleshooting
- Make sure Ollama is running and a model is loaded: `ollama list` and `ollama run <model>`
- Test Ollama directly:
  ```
  curl -X POST http://localhost:11434/api/generate -d '{"model":"llama3.1","prompt":"Say hi"}'
  ```
- If the server cannot reach Ollama, check that Ollama app is running and not blocked by firewall.

