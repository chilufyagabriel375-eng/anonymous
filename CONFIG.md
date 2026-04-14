# Configuration for ANONYMOUS CHAT AI

## Environment Setup

### Windows PowerShell Quick Setup

```powershell
# 1. Navigate to project
cd "c:\Users\SIR GABRIEL\Documents\CODE\anonymous"

# 2. Install dependencies (one time only)
python -m pip install flask requests

# 3. Set Groq API (Free & Recommended)
$env:GROQ_API_KEY = "gsk_your-key-from-console.groq.com"

# 4. Optional: Set OpenAI API (Paid)
$env:OPENAI_API_KEY = "sk-proj-your-key-from-platform.openai.com"

# 5. Start backend
python python.py

# Server will start on http://localhost:5000
```

### Windows Command Prompt Setup

```cmd
REM 1. Navigate to project
cd c:\Users\SIR GABRIEL\Documents\CODE\anonymous

REM 2. Install dependencies
python -m pip install flask requests

REM 3. Set Groq API
set GROQ_API_KEY=gsk_your-key

REM 4. Optional: Set OpenAI API
set OPENAI_API_KEY=sk-proj-your-key

REM 5. Start backend
python python.py
```

---

## API Keys Configuration

### Getting Groq API Key (FREE ⭐)
1. Visit: https://console.groq.com/keys
2. Click "Create New API Key"
3. Copy the key (starts with `gsk_`)
4. Use in PowerShell: `$env:GROQ_API_KEY = "gsk_xxx"`

### Getting OpenAI API Key (PAID)
1. Visit: https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Use in PowerShell: `$env:OPENAI_API_KEY = "sk-proj-xxx"`

---

## Backend Server Configuration

### Flask Default Settings
- **Host:** 127.0.0.1 (localhost)
- **Port:** 5000
- **Debug Mode:** Enabled (dev only)
- **Reload on Change:** Enabled

### Modify python.py for Custom Settings

```python
# At the bottom of python.py
if __name__ == '__main__':
    # Change port
    app.run(debug=True, port=5000)  # Change 5000 to another port
    
    # Disable debug for production
    app.run(debug=False, port=5000)
    
    # Allow remote connections
    app.run(debug=True, host='0.0.0.0', port=5000)
```

---

## Frontend Configuration

### Change API Endpoint
Edit HYTML.html line ~810:

```javascript
// Change localhost:5000 to your backend URL
const response = await fetch('http://localhost:5000/api/ai', {
  // Change to: http://your-server-ip:5000/api/ai
  // Or: https://your-domain.com/api/ai
```

### Change Frontend Port
```bash
# Default is 8000
python -m http.server 8000

# Change to different port
python -m http.server 3000
```

---

## AI Model Configuration

### OpenAI Model Options
```python
# In python.py, line 51
'model': 'gpt-3.5-turbo',      # Fast, $0.50/1M tokens
'model': 'gpt-4',               # Powerful, expensive
'model': 'gpt-4-turbo-preview', # Latest
```

### Groq Model Options
```python
# In python.py, line 107
'model': 'mixtral-8x7b-32768',    # Balanced
'model': 'llama2-70b-4096',       # Fast
'model': 'gemma-7b-it',           # Lightweight
```

### Customize Response Length
```python
# In python.py
'max_tokens': 500,   # Change to 1000 for longer responses
'temperature': 0.7,  # 0=deterministic, 1=creative
```

---

## Database Configuration (Future)

### To Add Database Support
Replace localStorage with database:

```python
# Add to python.py
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///anonymous.db'
db = SQLAlchemy(app)

# Create models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(255))
```

---

## Logging Configuration

### Enable Detailed Logging
```python
# Add to python.py
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Then in endpoints:
app.logger.debug(f"Received prompt: {prompt}")
app.logger.info(f"Using AI service: {service}")
app.logger.error(f"API error: {error}")
```

---

## CORS Configuration (for cross-origin requests)

### Enable CORS in Flask
```python
from flask_cors import CORS

CORS(app)  # Allow all origins

# Or specific origins only:
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000", "https://yourdomain.com"]
    }
})
```

### Install CORS package
```bash
pip install flask-cors
```

---

## Rate Limiting Configuration

### Add Rate Limiting
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/ai', methods=['POST'])
@limiter.limit("10 per minute")  # 10 requests per minute
def ai_api():
    # ... rest of code
```

### Install Limiter package
```bash
pip install flask-limiter
```

---

## Production Deployment

### Using Gunicorn
```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:5000 python:app

# Run in background
nohup gunicorn -w 4 -b 0.0.0.0:5000 python:app &
```

### Using Waitress (Windows-friendly)
```bash
# Install waitress
pip install waitress

# Run
waitress-serve --port=5000 python:app
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Security Configuration

### Environment Variables (.env file)
Create a `.env` file:
```
GROQ_API_KEY=gsk_xxx
OPENAI_API_KEY=sk-proj-xxx
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/db
```

### Load from .env file
```python
from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
```

### Install python-dotenv
```bash
pip install python-dotenv
```

---

## Performance Optimization

### Caching Responses
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_response(prompt):
    # Cache responses for identical prompts
    return build_ai_reply(prompt, "", [])
```

### Async Processing
```python
from asyncio import create_task

@app.route('/api/ai', methods=['POST'])
async def ai_api():
    # Process asynchronously
    task = create_task(build_ai_reply_async(prompt))
    response = await task
    return jsonify({'response': response})
```

---

## Monitoring & Debugging

### Flask Debug Toolbar
```python
from flask_debugtoolbar import DebugToolbarExtension

app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
toolbar = DebugToolbarExtension(app)
```

### Request Logging
```python
@app.before_request
def log_request():
    app.logger.info(f"Request: {request.method} {request.path}")

@app.after_request
def log_response(response):
    app.logger.info(f"Response: {response.status_code}")
    return response
```

---

## Troubleshooting Checklist

- [ ] Python 3.10+ installed
- [ ] Flask & Requests installed: `pip install flask requests`
- [ ] Backend running: `python python.py`
- [ ] Frontend accessible: `http://localhost:8000/HYTML.html`
- [ ] Backend responding: `http://localhost:5000/api/status`
- [ ] API key set (optional): `echo $env:GROQ_API_KEY`
- [ ] No firewall blocking port 5000
- [ ] Browser console shows no errors (F12)
- [ ] Backend terminal shows requests being processed
- [ ] localStorage working (dev tools → Application → Storage)

---

## Reference URLs

**API Services:**
- Groq: https://console.groq.com/
- OpenAI: https://platform.openai.com/
- DuckDuckGo: https://duckduckgo.com/api

**Documentation:**
- Flask: https://flask.palletsprojects.com/
- Python: https://docs.python.org/
- JavaScript: https://developer.mozilla.org/

**Tools:**
- Postman (API testing): https://www.postman.com/
- VS Code: https://code.visualstudio.com/
- Chrome DevTools: Press F12

---

Created by Gabriel Sandando | chilufyagabriel375@gmail.com
Last Updated: April 13, 2026
