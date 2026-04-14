from flask import Flask, request, jsonify, send_from_directory
import requests
from urllib.parse import quote_plus
import os

app = Flask(__name__, static_folder='.', static_url_path='')
conversation_memory = {}

# ============ OPENAI API CONFIGURATION ============
# To use OpenAI, set your API key: OPENAI_API_KEY environment variable
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')  # Set this from command line or .env file
USE_OPENAI = bool(OPENAI_API_KEY)

# You can also use Groq's API which has free tier
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
USE_GROQ = bool(GROQ_API_KEY)


def fetch_internet_summary(query: str) -> str:
    """Try to answer a query using DuckDuckGo instant answer."""
    if not query:
        return "I couldn't find enough information from the internet."

    url = f'https://api.duckduckgo.com/?q={quote_plus(query)}&format=json&no_html=1&skip_disambig=1'
    try:
        response = requests.get(url, timeout=6, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        data = response.json()
        abstract = data.get('AbstractText', '')
        if abstract:
            return abstract

        related = data.get('RelatedTopics', [])
        if isinstance(related, list) and related:
            first = related[0]
            if isinstance(first, dict) and first.get('Text'):
                return first['Text']
        return "I searched the internet but could not find a clear answer."
    except Exception:
        return "I couldn't reach the internet right now, but I can still chat with you."


def call_openai_api(prompt: str, history: list) -> str:
    """Call OpenAI's GPT model for intelligent responses."""
    if not OPENAI_API_KEY:
        return None
    
    try:
        messages = []
        # Add conversation history
        for msg in history[-5:]:  # Use last 5 messages for context
            if isinstance(msg, dict):
                messages.append({
                    'role': msg.get('role', 'user'),
                    'content': msg.get('content', '')
                })
        
        # Add current message
        messages.append({'role': 'user', 'content': prompt})
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-3.5-turbo',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 500
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content'].strip()
        else:
            return None
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


def call_groq_api(prompt: str, history: list) -> str:
    """Call Groq's API for fast, free AI responses."""
    if not GROQ_API_KEY:
        return None
    
    try:
        messages = []
        # Add conversation history
        for msg in history[-5:]:  # Use last 5 messages for context
            if isinstance(msg, dict):
                messages.append({
                    'role': msg.get('role', 'user'),
                    'content': msg.get('content', '')
                })
        
        # Add current message
        messages.append({'role': 'user', 'content': prompt})
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'mixtral-8x7b-32768',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 500
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content'].strip()
        else:
            return None
    except Exception as e:
        print(f"Groq API error: {e}")
        return None


def build_ai_reply(prompt: str, user_id: str, history: list) -> str:
    """Build AI response with multiple fallback strategies."""
    lower_prompt = prompt.lower()
    memory = conversation_memory.setdefault(user_id, [])

    # Try external AI APIs first (OpenAI or Groq)
    if USE_OPENAI:
        print("Trying OpenAI API...")
        response = call_openai_api(prompt, history)
        if response:
            return response
    
    if USE_GROQ:
        print("Trying Groq API...")
        response = call_groq_api(prompt, history)
        if response:
            return response

    # Fallback to internet search for factual questions
    if any(word in lower_prompt for word in ['news', 'search', 'internet', 'who is', 'what is', 'tell me about', 'how does', 'explain']):
        internet_answer = fetch_internet_summary(prompt)
        if "couldn't" not in internet_answer.lower():
            return internet_answer

    # Weather query
    if 'weather' in lower_prompt:
        location = lower_prompt.replace('weather', '').strip() or 'world'
        try:
            summary = requests.get(
                f'https://wttr.in/{quote_plus(location)}?format=3',
                timeout=6,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            if summary.ok:
                return summary.text.strip()
        except Exception:
            pass
        return f"I can't fetch the weather right now, but it's usually a good time to chat."

    # Built-in responses for common queries
    if any(greet in lower_prompt for greet in ['hello', 'hi', 'hey', 'greetings']):
        return "Hello! I'm your anonymous AI assistant powered by advanced AI models. Ask me anything!"
    if 'how are you' in lower_prompt:
        return "I'm doing great, thank you! I'm always learning from our conversations. How can I help you today?"
    if 'joke' in lower_prompt:
        jokes = [
            "Why did the AI go to school? To improve its learning algorithm!",
            "What's an AI's favorite music? Algo-rhythms!",
            "Why do programmers prefer dark mode? Because light attracts bugs!"
        ]
        import random
        return random.choice(jokes)
    if 'learn' in lower_prompt or 'remember' in lower_prompt:
        return "I'm constantly learning from our conversations! Each interaction helps me provide better responses. What else would you like to discuss?"
    if 'time' in lower_prompt:
        from datetime import datetime
        return f"The current time is {datetime.now().strftime('%H:%M:%S')}"
    if 'date' in lower_prompt:
        from datetime import date
        return f"Today is {date.today().strftime('%Y-%m-%d')}"

    # Store in memory
    if history:
        memory.append({'prompt': prompt})
        if len(memory) > 20:
            memory.pop(0)

    # Generic fallback responses
    generic_responses = [
        "That's interesting! Tell me more about that.",
        "I see. Can you provide more details?",
        "That's a great question! What specific aspect would you like to explore?",
        "I'm learning from this conversation. What else is on your mind?",
        "Fascinating! How does that make you feel?"
    ]
    import random
    return random.choice(generic_responses)


@app.route('/')
@app.route('/HYTML.html')
def index():
    return send_from_directory('.', 'HYTML.html')


@app.route('/api/ai', methods=['POST'])
def ai_api():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id', 'anonymous')
    prompt = data.get('prompt', '')
    history = data.get('history', [])

    if not prompt:
        return jsonify({'response': "Please send a question or message so I can respond."})

    answer = build_ai_reply(prompt, user_id, history)
    return jsonify({
        'response': answer,
        'user_id': user_id,
        'source': 'enhanced-ai-backend'
    })


@app.route('/api/status', methods=['GET'])
def api_status():
    """Check which AI services are available."""
    return jsonify({
        'openai_available': USE_OPENAI,
        'groq_available': USE_GROQ,
        'internet_search': True,
        'fallback_responses': True
    })


if __name__ == '__main__':
    print("=" * 60)
    print("ANONYMOUS CHAT AI BACKEND")
    print("=" * 60)
    if USE_OPENAI:
        print("✓ OpenAI API configured")
    if USE_GROQ:
        print("✓ Groq API configured")
    print("✓ Internet search (DuckDuckGo) available")
    print("✓ Built-in fallback responses available")
    print("\nTo enable OpenAI: set OPENAI_API_KEY environment variable")
    print("To enable Groq (free): set GROQ_API_KEY environment variable")
    print("\nStarting server on http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)


@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
