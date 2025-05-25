from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from langchain_logic import get_bot_response



#load Environment variablers
load_dotenv()

#Builds the flask app
app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet') 

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
    user_message = data['text']
    print(f"User message: {user_message}")
    
    bot_response = get_bot_response(user_message)
    print(f"Bot response: {bot_response}")
    
    emit('bot_message', {'text': bot_response})
    
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)

