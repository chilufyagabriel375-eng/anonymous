# 🤖 ANONYMOUS CHAT - AI API Setup Guide

## Overview
Your Anonymous Chat app now integrates with advanced AI models via **OpenAI** and **Groq** APIs. The system uses a smart fallback strategy to ensure the AI always responds, even if external APIs are unavailable.

---

## 🚀 Quick Start (Local Development)

### 1. Install Required Python Packages
```bash
pip install flask requests
```

### 2. Start the Backend Server
```bash
cd c:\Users\SIR GABRIEL\Documents\CODE\anonymous
python python.py
```

The server will start on `http://localhost:5000`

**Output:**
```
============================================================
ANONYMOUS CHAT AI BACKEND
============================================================
✓ Internet search (DuckDuckGo) available
✓ Built-in fallback responses available

To enable OpenAI: set OPENAI_API_KEY environment variable
To enable Groq (free): set GROQ_API_KEY environment variable

Starting server on http://localhost:5000
============================================================
```

### 3. Access the App
Open `http://localhost:8000/HYTML.html` in your browser (the HTTP server should already be running)

---

## 🔑 Using OpenAI API (Paid)

### Step 1: Get OpenAI API Key
1. Visit: https://platform.openai.com/api/keys
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the key (you won't see it again!)

### Step 2: Set the API Key

**On Windows PowerShell:**
```powershell
$env:OPENAI_API_KEY = "sk-proj-your-api-key-here"
python python.py
```

**Or set it permanently:**
```powershell
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-proj-your-api-key-here", "User")
```
Then restart your terminal.

**On Command Prompt:**
```cmd
set OPENAI_API_KEY=sk-proj-your-api-key-here
python python.py
```

### Step 3: Verify
Start the server and check the output - you should see:
```
✓ OpenAI API configured
```

---

## 🎉 Using Groq API (Free & Fast!)

**Groq is recommended!** It's free, fast, and has generous rate limits.

### Step 1: Get Groq API Key
1. Visit: https://console.groq.com/keys
2. Sign up with Google or GitHub (free)
3. Create an API key
4. Copy the key

### Step 2: Set the API Key

**On Windows PowerShell:**
```powershell
$env:GROQ_API_KEY = "gsk_your-groq-key-here"
python python.py
```

**Or set it permanently:**
```powershell
[Environment]::SetEnvironmentVariable("GROQ_API_KEY", "gsk_your-groq-key-here", "User")
```

**On Command Prompt:**
```cmd
set GROQ_API_KEY=gsk_your-groq-key-here
python python.py
```

### Step 3: Verify
Start the server and check the output - you should see:
```
✓ Groq API configured
```

---

## 📋 Using Both APIs (Recommended)

Set both API keys for maximum reliability:

**PowerShell:**
```powershell
$env:OPENAI_API_KEY = "sk-proj-your-openai-key"
$env:GROQ_API_KEY = "gsk_your-groq-key"
python python.py
```

**Output:**
```
✓ OpenAI API configured
✓ Groq API configured
✓ Internet search (DuckDuckGo) available
✓ Built-in fallback responses available
```

---

## 🔄 AI Response Priority Order

1. **OpenAI API** - If configured and available
2. **Groq API** - If configured and available
3. **Internet Search** - For factual queries (weather, news, who is, etc.)
4. **Built-in Responses** - Local knowledge base (jokes, time, date, etc.)

---

## 🌐 Features & Capabilities

### What the AI Can Do:

✅ **Answer questions** using advanced language models
✅ **Search the internet** for latest news and information
✅ **Tell you the time and date**
✅ **Get weather** for any location
✅ **Tell jokes** and have fun conversations
✅ **Remember conversation context** within a session
✅ **Provide explanations** and help with problem-solving
✅ **Learn** from your conversation patterns

### Example Queries:
- "Who is Elon Musk?" → Internet search
- "What's the weather in London?" → Live weather data
- "Tell me a joke" → Built-in database
- "Explain quantum computing" → AI model (if configured)
- "What time is it?" → Local time
- "Search for latest AI news" → Internet search

---

## 🛠️ Troubleshooting

### Issue: "Flask backend unavailable"
**Solution:** Make sure `python python.py` is running on port 5000

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Or start the server
cd c:\Users\SIR GABRIEL\Documents\CODE\anonymous
python python.py
```

### Issue: OpenAI API shows 401 Unauthorized
**Solution:** Check your API key is correct and hasn't expired

```powershell
# Verify the key is set
echo $env:OPENAI_API_KEY
```

### Issue: No internet search results
**Solution:** DuckDuckGo might be blocking requests. The system will use built-in responses as fallback.

### Issue: Responses are slow
**Solution:** This is normal with remote APIs. Groq is faster than OpenAI. Consider using Groq.

---

## 📊 API Costs

| Provider | Model | Cost | Speed | Notes |
|----------|-------|------|-------|-------|
| **OpenAI** | GPT-3.5-Turbo | ~$0.50-1 per 1M tokens | Medium | Most powerful, paid |
| **Groq** | Mixtral 8x7B | FREE | Very Fast | Free tier generously available |
| **DuckDuckGo** | Search | FREE | Fast | Built-in internet search |

---

## 🔐 Security Notes

⚠️ **NEVER** commit your API keys to GitHub!

**Best practices:**
- Use environment variables (not hardcoded)
- Keep API keys secret and rotate them regularly
- Monitor API usage and costs
- Use Groq for free tier access

---

## 📚 Useful Links

- **OpenAI API Docs:** https://platform.openai.com/docs/
- **OpenAI Pricing:** https://openai.com/pricing/
- **Groq Console:** https://console.groq.com/
- **Groq Models:** https://console.groq.com/docs
- **DuckDuckGo API:** https://duckduckgo.com/api

---

## ✨ Next Steps

1. ✅ Install Flask and Requests: `pip install flask requests`
2. ✅ Get a Groq API key (free): https://console.groq.com/keys
3. ✅ Set the API key in PowerShell
4. ✅ Run `python python.py`
5. ✅ Open the app and chat with your AI!

Enjoy your AI-powered anonymous chat app! 🚀
