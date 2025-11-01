import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { auth } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = async (message) => {
    try {
      setLoading(true);
      console.log("Starting chat with message:", message);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth.token ? `Bearer ${auth.token}` : undefined,
        },
        body: JSON.stringify({
          subject: 'General Inquiry',
          message
        }),
      });

      console.log("Chat start response:", response.status, response.statusText);
      const data = await response.json();
      console.log("Chat start data:", data);

      if (data.success) {
        setConversationId(data.data.conversationId);
        setMessages([{
          id: data.data.messageId,
          message,
          senderType: 'user',
          createdAt: new Date().toISOString(),
          senderId: auth.user?.id
        }]);
        setNewMessage('');
      } else {
        setError(data.message || 'Failed to start chat');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Start chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const messageText = newMessage.trim();
    console.log("Sending message:", messageText);
    setNewMessage('');

    if (!conversationId) {
      console.log("No conversation ID, starting new chat");
      await startChat(messageText);
      return;
    }

    try {
      setLoading(true);
      console.log("Sending message to conversation:", conversationId);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${conversationId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth.token ? `Bearer ${auth.token}` : undefined,
        },
        body: JSON.stringify({
          message: messageText
        }),
      });

      console.log("Send message response:", response.status, response.statusText);
      const data = await response.json();
      console.log("Send message data:", data);

      if (data.success) {
        setMessages(prev => [...prev, {
          id: data.data.messageId,
          message: messageText,
          senderType: 'user',
          createdAt: new Date().toISOString(),
          senderId: auth.user?.id
        }]);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Send message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    console.log("Chat widget toggled, isOpen:", !isOpen);
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (error) setError('');
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-[#BCC571] hover:bg-[#a9b45d] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${
      isMinimized ? 'w-80 h-12' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="bg-[#BCC571] text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Chat with Pranam</h3>
          {!isMinimized && (
            <p className="text-sm opacity-90">We're here to help</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={minimizeChat}
            className="hover:bg-[#a9b45d] p-1 rounded"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={toggleChat}
            className="hover:bg-[#a9b45d] p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <p>Welcome to Pranam Chat!</p>
                <p>Send a message to start the conversation.</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.senderType === 'user'
                      ? 'bg-[#BCC571] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BCC571] disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !newMessage.trim()}
                className="bg-[#BCC571] hover:bg-[#a9b45d] text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
