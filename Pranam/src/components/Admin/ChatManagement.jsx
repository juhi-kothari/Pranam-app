import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ChatManagement = () => {
  const { auth } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversationId);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/chats`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.data.conversations || []);
      } else {
        setError(data.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages || []);
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Fetch messages error:', error);
    }
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim() || sending || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/${selectedConversation.conversationId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          message: messageText
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Add message to local state
        const newMsg = {
          _id: data.data.messageId,
          message: messageText,
          senderType: 'admin',
          createdAt: new Date().toISOString(),
          senderId: auth.user
        };
        setMessages(prev => [...prev, newMsg]);

        // Update conversation in list
        setConversations(prev => prev.map(conv =>
          conv.conversationId === selectedConversation.conversationId
            ? { ...conv, lastMessageAt: new Date().toISOString(), lastMessageBy: 'admin' }
            : conv
        ));
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Send admin message error:', error);
    } finally {
      setSending(false);
    }
  };

  const updateConversationStatus = async (conversationId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/chats/${conversationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update conversation in list
        setConversations(prev => prev.map(conv =>
          conv.conversationId === conversationId
            ? { ...conv, status: newStatus }
            : conv
        ));

        // Update selected conversation if it's the current one
        if (selectedConversation?.conversationId === conversationId) {
          setSelectedConversation(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Update status error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BCC571]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MessageSquare className="mr-2" size={20} />
            Chat Conversations ({conversations.length})
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.conversationId === conversation.conversationId ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <User size={16} className="mr-2 text-gray-400" />
                    <span className="font-medium text-sm">
                      {conversation.userId?.name || 'Anonymous User'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                    {conversation.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {conversation.subject || 'General Inquiry'}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatDate(conversation.lastMessageAt)}
                  </span>
                  {conversation.unreadCount?.admin > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      {conversation.unreadCount.admin}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedConversation.userId?.name || 'Anonymous User'}
                  </h4>
                  <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => updateConversationStatus(selectedConversation.conversationId, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedConversation.status)}`}>
                    {selectedConversation.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderType === 'admin'
                        ? 'bg-[#BCC571] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderType === 'admin' ? 'text-white opacity-75' : 'text-gray-500'
                    }`}>
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage()}
                  placeholder="Type your response..."
                  disabled={sending}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#BCC571] disabled:opacity-50"
                />
                <button
                  onClick={sendAdminMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-[#BCC571] hover:bg-[#a9b45d] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
        </div>
      )}
    </div>
  );
};

export default ChatManagement;
