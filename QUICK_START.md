# ⚡ Quick Command Reference

## Starting the Application

### Terminal 1: Backend Server
```bash
cd "c:\Users\SIR GABRIEL\Documents\CODE\anonymous"
python python.py
```
✓ Runs on http://localhost:5000
✓ AI API endpoint available
✓ Internet search enabled

### Terminal 2: Frontend Server
```bash
cd "c:\Users\SIR GABRIEL\Documents\CODE\anonymous"
python -m http.server 8000
```
✓ Runs on http://localhost:8000
✓ Serves HYTML.html
✓ Static files accessible

### Open the App
```
http://localhost:8000/HYTML.html
```

---

## Enabling AI APIs

### Groq API (FREE - Recommended ⭐)

**Get Key:** https://console.groq.com/keys

**PowerShell:**
```powershell
$env:GROQ_API_KEY = "gsk_your-key-here"
python python.py
```

**Command Prompt:**
```cmd
set GROQ_API_KEY=gsk_your-key-here
python python.py
```

---

### OpenAI API (PAID)

**Get Key:** https://platform.openai.com/api/keys

**PowerShell:**
```powershell
$env:OPENAI_API_KEY = "sk-proj-your-key-here"
python python.py
```

**Command Prompt:**
```cmd
set OPENAI_API_KEY=sk-proj-your-key-here
python python.py
```

---

### Both APIs (Maximum Power 💪)

**PowerShell:**
```powershell
$env:GROQ_API_KEY = "gsk_your-groq-key"
$env:OPENAI_API_KEY = "sk-proj-your-openai-key"
python python.py
```

---

## Permanent Environment Variables (Windows)

### PowerShell (Permanent)
```powershell
[Environment]::SetEnvironmentVariable("GROQ_API_KEY", "gsk_your-key", "User")
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-proj-your-key", "User")
```
Then restart your terminal.

### Check Variables
```powershell
echo $env:GROQ_API_KEY
echo $env:OPENAI_API_KEY
```

---

## Installation Commands

### First Time Setup
```bash
cd "c:\Users\SIR GABRIEL\Documents\CODE\anonymous"
python -m pip install flask requests
```

### Update Packages
```bash
python -m pip install --upgrade flask requests
```

### Check Installed Packages
```bash
python -m pip list
```

---

## Testing AI Endpoint

### Using curl (Windows PowerShell)
```powershell
$payload = @{
    user_id = "test-user"
    prompt = "Hello, how are you?"
    history = @()
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/ai" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $payload
```

### Using Python
```python
import requests

response = requests.post("http://localhost:5000/api/ai", json={
    "user_id": "test-user",
    "prompt": "Hello, how are you?",
    "history": []
})

print(response.json())
```

---

## API Endpoints

### POST /api/ai
Get AI response to a prompt

**Request:**
```json
{
  "user_id": "user-123",
  "prompt": "Your question here",
  "history": [{"role": "user", "content": "previous message"}]
}
```

**Response:**
```json
{
  "response": "AI answer here",
  "user_id": "user-123",
  "source": "enhanced-ai-backend"
}
```

### GET /api/status
Check available AI services

**Response:**
```json
{
  "openai_available": true,
  "groq_available": true,
  "internet_search": true,
  "fallback_responses": true
}
```

---

## File Locations

| File | Purpose | Path |
|------|---------|------|
| HYTML.html | Main app | `c:\Users\SIR GABRIEL\Documents\CODE\anonymous\HYTML.html` |
| python.py | Backend | `c:\Users\SIR GABRIEL\Documents\CODE\anonymous\python.py` |
| anonymous.jpg | Logo | `c:\Users\SIR GABRIEL\Documents\CODE\anonymous\anonymous.jpg` |
| README.md | Docs | `c:\Users\SIR GABRIEL\Documents\CODE\anonymous\README.md` |
| SETUP_AI_APIS.md | API guide | `c:\Users\SIR GABRIEL\Documents\CODE\anonymous\SETUP_AI_APIS.md` |

---

## Debug Mode

### Check Flask Debug
Backend should show:
```
* Debug mode: on
```

### Enable Verbose Logging (Edit python.py)
```python
if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Check Browser Console
Press F12 → Console tab
Look for API responses and errors

---

## Common Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 8000 | http://localhost:8000 |
| Backend | 5000 | http://localhost:5000 |
| Flask Debug | 5000 | http://localhost:5000 |

---

## Stopping Services

### Stop Flask Backend
In the backend terminal:
```
Press CTRL+C
```

### Stop Frontend Server
In the frontend terminal:
```
Press CTRL+C
```

---

## Resources

📚 **Documentation:**
- Flask: https://flask.palletsprojects.com/
- Groq: https://console.groq.com/docs
- OpenAI: https://platform.openai.com/docs/

🔑 **API Keys:**
- Groq (Free): https://console.groq.com/keys
- OpenAI (Paid): https://platform.openai.com/api/keys

🌐 **Free APIs Used:**
- DuckDuckGo Search
- wttr.in Weather
- BroadcastChannel API

---

## Tips & Tricks

✨ **Use Groq for best free experience** - Fast and generous rate limits

✨ **Keep terminals open** - Leave both backend and frontend running

✨ **Clear cache** - If bugs occur: Ctrl+Shift+Delete → Clear all

✨ **Check logs** - Watch terminal output for API errors

✨ **Test locally first** - Before deploying to production

---

Created by Gabriel Sandando | chilufyagabriel375@gmail.com
