# 🚀 ANONYMOUS CHAT - Complete Setup & Features

Your anonymous chat application now includes:
- ✅ Real-time chat with multiple rooms
- ✅ Private 1-on-1 encrypted chat
- ✅ AI Assistant with voice support
- ✅ Marketplace with ZMW pricing
- ✅ User authentication (login/signup)
- ✅ Integration with OpenAI, Groq, and internet search
- ✅ Fully serverless architecture

---

## 📋 Prerequisites

- Python 3.10+ (already installed)
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection

---

## 🎯 Quick Setup (2 minutes)

### 1. Install Backend Dependencies
```bash
cd "c:\Users\SIR GABRIEL\Documents\CODE\anonymous"
python -m pip install flask requests
```

### 2. Start the Backend Server
```bash
python python.py
```

**Expected Output:**
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

### 3. Start the Frontend Server (Another Terminal)
```bash
cd "c:\Users\SIR GABRIEL\Documents\CODE\anonymous"
python -m http.server 8000
```

### 4. Open the App
Visit: **http://localhost:8000/HYTML.html**

---

## 🤖 AI Integration (Optional but Recommended)

### Using Groq API (FREE & FAST)

**Step 1: Get API Key**
1. Visit: https://console.groq.com/keys
2. Sign up (free with GitHub or Google)
3. Create and copy your API key

**Step 2: Set Environment Variable (PowerShell)**
```powershell
$env:GROQ_API_KEY = "gsk_your-key-here"
python python.py
```

**Step 3: Verify Setup**
Check that the server output shows:
```
✓ Groq API configured
```

---

### Using OpenAI API (PAID but Powerful)

**Step 1: Get API Key**
1. Visit: https://platform.openai.com/api/keys
2. Create account or sign in
3. Generate and copy API key

**Step 2: Set Environment Variable (PowerShell)**
```powershell
$env:OPENAI_API_KEY = "sk-proj-your-key-here"
python python.py
```

---

## 📱 Features Guide

### 🏠 Main Chat Room
- Join any room (default: "general")
- Change nickname
- Send/receive messages in real-time
- Mention `@ai` to chat with AI Assistant
- Sound alerts for new messages
- Copy invite links to share rooms

### 🤖 AI Assistant
- Click floating robot icon (bottom-right) or navbar AI button
- Ask questions, get intelligent responses
- Voice input & voice output support
- Powered by OpenAI/Groq (if configured)
- Fallback to internet search or built-in knowledge
- Conversation history for context

### 🔒 Private Chat
- Click "Private Chat" in navbar
- Each user gets a unique code (e.g., PRIV-ABC123)
- Share your code with someone to let them join
- Only 2 people can see messages
- 100% private, all stored locally
- Real-time sync via BroadcastChannel

### 🛒 Marketplace
- **Sign in required** to list items
- Upload photo, set price in ZMW
- Browse items from other users
- Add descriptions to products
- All items stored locally (serverless)

### 🔐 User Accounts
- Sign up with name, email, password
- Login/logout functionality
- Your profile in navbar with avatar
- Passwords hashed (simple demo hashing)
- Session persistence across browser restarts

---

## 🧠 AI Capabilities

**With Groq/OpenAI Enabled:**
- Answer complex questions
- Provide explanations
- Creative writing & brainstorming
- Code help & debugging
- General knowledge questions

**Always Available (No API Needed):**
- Current time & date
- Jokes & humor
- Weather info (via wttr.in)
- News & search (via DuckDuckGo)
- Conversation context

**Example Queries:**
```
"Who is Elon Musk?" 
→ Groq/OpenAI (if enabled) or Internet search

"What's the weather in Tokyo?"
→ Live weather data from wttr.in

"Tell me a joke"
→ Built-in joke database

"Explain quantum physics"
→ Groq/OpenAI (if enabled)

"What's the current time?"
→ Local system time
```

---

## 🔧 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│           ANONYMOUS CHAT APPLICATION                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (HYTML.html)                                  │
│  ├─ Chat Interface                                      │
│  ├─ Private Chat Module                                 │
│  ├─ Marketplace Section                                 │
│  ├─ AI Assistant Modal                                  │
│  └─ Auth System (Login/Signup)                         │
│                                                          │
│  ↓ HTTP/WebSocket                                       │
│                                                          │
│  Backend (python.py)                                    │
│  ├─ Flask Server (localhost:5000)                      │
│  ├─ /api/ai endpoint                                    │
│  ├─ OpenAI integration                                  │
│  ├─ Groq integration                                    │
│  └─ Internet search (DuckDuckGo)                       │
│                                                          │
│  Data Storage                                           │
│  ├─ Browser localStorage (chat, marketplace, users)     │
│  ├─ BroadcastChannel (real-time sync)                  │
│  └─ Server-side conversation memory                     │
│                                                          │
│  External APIs (Optional)                               │
│  ├─ OpenAI API (gpt-3.5-turbo)                         │
│  ├─ Groq API (mixtral-8x7b-32768)                       │
│  ├─ DuckDuckGo API (internet search)                    │
│  └─ wttr.in API (weather)                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 API Integration Overview

| Component | Purpose | Status | Config |
|-----------|---------|--------|--------|
| **OpenAI** | Advanced AI responses | Optional | `OPENAI_API_KEY` |
| **Groq** | Fast free AI (⭐ Recommended) | Optional | `GROQ_API_KEY` |
| **DuckDuckGo** | Internet search | Always on | No setup needed |
| **wttr.in** | Weather data | Always on | No setup needed |
| **Flask** | Backend server | Required | `python python.py` |
| **BroadcastChannel** | Real-time chat sync | Built-in | No setup needed |

---

## 🎨 UI/UX Features

✨ **Dark Theme** with purple/blue accent colors
🌙 **Light Mode Toggle** (moon icon in navbar)
📱 **Responsive Design** - works on mobile, tablet, desktop
🎭 **Smooth Animations** - slide-in messages, fade effects
⚡ **Fast Interactions** - instant message delivery
🔔 **Audio Alerts** - notification sounds (toggleable)
🎤 **Voice Features** - speech-to-text input & text-to-speech output
♿ **Accessible** - keyboard navigation, clear labels

---

## 🔒 Security & Privacy

✅ **100% Serverless** - No server stores your data
✅ **Local Storage** - All data in your browser
✅ **No Tracking** - No analytics or trackers
✅ **Private Chat Encryption** - Messages visible only to room participants
✅ **Anonymous by Default** - Optional accounts for marketplace
✅ **Password Hashing** - Accounts use hashed passwords (demo-grade)
⚠️ **Note** - This is a demo app. Use proper security for production

---

## 📖 Usage Examples

### Creating a Private Chat
1. Click "🔒 Private Chat" in navbar
2. Your code appears: e.g., "PRIV-ABC123"
3. Click "Copy Code"
4. Send code to friend (email, message, etc.)
5. Friend clicks "🔒 Private Chat" 
6. Friend enters your code
7. Instant private chat! 🎉

### Listing Marketplace Items
1. Sign up for an account (top right)
2. Scroll to Marketplace section
3. Fill in: Title, Price (ZMW), Photo, Description
4. Click "List Item"
5. Your item appears in the gallery
6. Others can see and inquire

### Using AI Assistant
1. Click robot icon (bottom-right) or navbar AI
2. Type your question
3. AI responds with:
   - Groq/OpenAI (if APIs enabled)
   - Internet search (if factual)
   - Built-in knowledge (jokes, time, etc.)
4. Enable voice: click speaker icon for text-to-speech

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to localhost:5000" | Make sure `python python.py` is running |
| Flask module not found | Run `python -m pip install flask requests` |
| Marketplace shows "Please sign in" | Click "Sign Up" in navbar to create account |
| AI responses are slow | This is normal. Groq is fastest, OpenAI is slower |
| Private chat not syncing | Check browser supports BroadcastChannel (all modern browsers) |
| Messages disappearing | Data is in localStorage. Clearing browser cache deletes data |
| Marketplace items empty | Items are stored locally per browser. Try a different browser to test |

---

## 🚀 Advanced Configuration

### Using Custom OpenAI Models
Edit `python.py` line 51:
```python
'model': 'gpt-4',  # Change from gpt-3.5-turbo
```

### Using Different Groq Models
Edit `python.py` line 107:
```python
'model': 'llama2-70b-4096',  # Other options available
```

### Changing AI Response Tokens
Edit `python.py`:
```python
'max_tokens': 1000,  # Increase for longer responses
```

---

## 📚 File Structure

```
anonymous/
├── HYTML.html              # Main app (HTML/CSS/JS)
├── python.py               # Flask backend
├── anonymous.jpg           # App logo/icon
├── SETUP_AI_APIS.md        # API setup guide
├── README.md               # This file
└── .git/                   # Version control
```

---

## 🌐 Deployment (Production)

For production deployment:

1. **Use a proper WSGI server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 python:app
   ```

2. **Use a reverse proxy (Nginx/Apache)**
   - Forward requests to gunicorn
   - Enable SSL/HTTPS

3. **Secure your API keys**
   - Use environment variables
   - Use secrets management (AWS Secrets, etc.)

4. **Enable CORS for cross-origin requests**
   - Update Flask app with CORS headers

5. **Database backend**
   - Replace localStorage with a database
   - Store users, messages, marketplace items

6. **Rate limiting**
   - Prevent abuse of API endpoints
   - Set user rate limits

---

## 📞 Support & Contact

**App Creator:** Gabriel Sandando  
**Email:** chilufyagabriel375@gmail.com  
**Last Updated:** April 13, 2026

---

## 📄 License

This project is open source and available for personal and commercial use.

---

## ✅ Checklist

- [ ] Install Flask and Requests
- [ ] Start backend: `python python.py`
- [ ] Start frontend: `python -m http.server 8000`
- [ ] Open http://localhost:8000/HYTML.html
- [ ] Create an account
- [ ] Chat in the main room
- [ ] Try AI Assistant
- [ ] Create private chat
- [ ] List marketplace item
- [ ] (Optional) Set up Groq or OpenAI API

---

🎉 **Enjoy your anonymous chat app!** 🎉
