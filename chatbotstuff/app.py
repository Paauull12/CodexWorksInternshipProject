from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from utils.memory import ConversationMemory
from chains.todo_chain import TodoChain
import jwt
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  

memory = ConversationMemory()
todo_chain = TodoChain(memory)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        kwargs['token'] = token
        return f(*args, **kwargs)
    
    return decorated

@app.route('/chat', methods=['POST'])
@token_required
def chat(token):
    data = request.json
    user_message = data.get('message', '')
    
    response, commands = todo_chain.process(user_message, token)
    
    return jsonify({
        'response': response,
        'commands': commands
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)