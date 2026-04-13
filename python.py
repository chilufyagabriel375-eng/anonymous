from flask import Flask, request, jsonify, send_from_directory
import requests
from urllib.parse import quote_plus

app = Flask(__name__, static_folder='.', static_url_path='')
conversation_memory = {}


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


def build_ai_reply(prompt: str, user_id: str, history: list) -> str:
    lower_prompt = prompt.lower()
    memory = conversation_memory.setdefault(user_id, [])

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

    if any(word in lower_prompt for word in ['news', 'search', 'internet', 'who is', 'what is', 'tell me about']):
        internet_answer = fetch_internet_summary(prompt)
        return internet_answer

    if any(greet in lower_prompt for greet in ['hello', 'hi', 'hey', 'greetings']):
        return "Hello! I'm your anonymous AI. Ask me anything or tell me how I can help."
    if 'how are you' in lower_prompt:
        return "I'm doing well, thank you! I'm always learning from our chats."
    if 'joke' in lower_prompt:
        return "Why did the computer get cold? Because it forgot to close its Windows!"
    if 'learn' in lower_prompt or 'remember' in lower_prompt:
        return "I remember this conversation and will use it to improve my answers while we keep chatting."
    if 'time' in lower_prompt:
        from datetime import datetime
        return f"The current time is {datetime.now().strftime('%H:%M:%S')}"
    if 'date' in lower_prompt:
        from datetime import date
        return f"Today is {date.today().strftime('%Y-%m-%d')}"

    if history:
        memory.append({'prompt': prompt})
        if len(memory) > 20:
            memory.pop(0)

    return "That's interesting! Tell me more, and I can use it to improve our conversation."


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
        'source': 'python-backend'
    })


@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
