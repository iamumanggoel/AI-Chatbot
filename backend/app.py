from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_socketio import SocketIO, emit



#load Environment variablers
load_dotenv()

#Builds the flask app
app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*") 

@app.route('/', methods=['GET'])
def index():
    return jsonify({"status": "Chatbot backend is running!"})


@socketio.on('connect')
def handle_connect(_):
    print('Client connected')
    emit('bot_message', {'text': 'Hello! How can I help you?'})
    
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('user_message')
def handle_user_message(data):
    user_text = data.get('text', "")
    print("User message:", user_text)

    # Send the message with history to LLM

    bot_reply = f"You said: {user_text}"
    emit('bot_message', {'text': bot_reply})
    
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
