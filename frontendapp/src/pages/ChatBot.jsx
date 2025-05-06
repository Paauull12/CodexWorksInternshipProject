import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const shouldRefreshRef = useRef(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      
      const shouldOpen = localStorage.getItem('chatbotOpen');
      if (shouldOpen === 'true') {
        setIsOpen(true);
      }
    } else {
      const defaultMessage = { 
        id: 1, 
        text: 'Hello! I can help you manage your TODOs. Ask me to create, update, or list your tasks.', 
        sender: 'bot' 
      };
      setMessages([defaultMessage]);
      localStorage.setItem('chatMessages', JSON.stringify([defaultMessage]));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
      
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.sender === 'bot' && shouldRefreshRef.current) {
        shouldRefreshRef.current = false;
        
        localStorage.setItem('chatbotOpen', 'true');
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatbotOpen', isOpen.toString());
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessageToAI = async (messageText) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        return "Please login to use the TODO assistant.";
      }

      const response = await axios.post('/chat', 
        { message: messageText },
        { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseText = response.data.response;
      const isActionCommand = 
        responseText.includes("created") || 
        responseText.includes("updated") || 
        responseText.includes("deleted") || 
        responseText.includes("marked");
      
      if (isActionCommand) {
        shouldRefreshRef.current = true;
      }
      
      return responseText;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      if (error.response && error.response.status === 401) {
        return "Your session has expired. Please login again.";
      }
      
      return "Sorry, I'm having trouble connecting to the server. Please try again later.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageId = Date.now();
    
    const userMessage = {
      id: messageId,
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    
    setIsTyping(true);
    
    const aiResponse = await sendMessageToAI(newMessage);
    
    const botMessage = {
      id: messageId + 1,
      text: aiResponse,
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, botMessage]);
    setIsTyping(false);
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      const defaultMessage = { 
        id: Date.now(), 
        text: 'Hello! I can help you manage your TODOs. Ask me to create, update, or list your tasks.', 
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages([defaultMessage]);
      localStorage.setItem('chatMessages', JSON.stringify([defaultMessage]));
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="bg-indigo-600 rounded-full w-14 h-14 flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl flex flex-col fixed md:absolute bottom-0 right-0 left-0 md:left-auto md:bottom-0 md:right-0 
                      w-full md:w-[50vw] lg:w-[40vw] max-w-3xl h-[70vh] md:h-[600px] max-h-[calc(100vh-2rem)] 
                      border border-gray-200 overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">TODO Assistant</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearChatHistory} 
                className="text-xs bg-indigo-500 hover:bg-indigo-400 px-2 py-1 rounded"
                title="Clear chat history"
              >
                Clear History
              </button>
              <button onClick={toggleChat} className="text-white hover:text-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
                {message.timestamp && (
                  <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="text-left mb-3">
                <div className="inline-block px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce"></div>
                    <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="bg-gray-400 rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 py-2 px-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotComponent;