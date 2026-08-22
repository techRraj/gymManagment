import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaSearch, FaPaperPlane, FaCheck, FaCheckDouble, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Messages.css';

const Messages = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Poll for new messages every 5 seconds
    pollIntervalRef.current = setInterval(fetchConversations, 5000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.user._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.conversations || []);
      
      // Check for unread messages and notify
      const unreadCount = res.data.conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
      if (unreadCount > 0) {
        // You could update a global context here for navbar badge
        console.log(`🔔 ${unreadCount} unread message(s)`);
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data.messages || []);
      
      // Mark as read
      await api.put(`/messages/mark-read/${userId}`);
      fetchConversations(); // Refresh unread counts
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await api.post('/messages', {
        receiverId: selectedChat.user._id,
        content: newMessage.trim()
      });
      setNewMessage('');
      fetchMessages(selectedChat.user._id);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messenger-container">
        {/* Conversations Sidebar */}
        <div className={`conversations-sidebar ${selectedChat ? 'hidden-mobile' : ''}`}>
          <div className="sidebar-header">
            <h2>Messages</h2>
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="no-conversations">
                <FaPaperPlane />
                <p>No conversations yet</p>
                <button className="btn btn-primary" onClick={() => navigate('/matches')}>
                  Find Matches to Message
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.user._id}
                  className={`conversation-item ${selectedChat?.user._id === conv.user._id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => setSelectedChat(conv)}
                >
                  <div className="conversation-avatar">
                    <img
                      src={conv.user.avatar || `https://ui-avatars.com/api/?name=${conv.user.name}&background=00d9ff&color=fff`}
                      alt={conv.user.name}
                    />
                    {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h3>{conv.user.name}</h3>
                      <span className="last-message-time">{formatTime(conv.lastMessage?.createdAt)}</span>
                    </div>
                    <div className="last-message">
                      {conv.lastMessage?.sender._id === currentUser._id && (
                        <FaCheck className="message-status" />
                      )}
                      <p>{conv.lastMessage?.content || 'No messages yet'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`chat-window ${!selectedChat ? 'hidden-mobile' : ''}`}>
          {selectedChat ? (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={() => setSelectedChat(null)}>
                  <FaArrowLeft />
                </button>
                <div className="chat-header-info">
                  <img
                    src={selectedChat.user.avatar || `https://ui-avatars.com/api/?name=${selectedChat.user.name}&background=00d9ff&color=fff`}
                    alt={selectedChat.user.name}
                  />
                  <div>
                    <h3>{selectedChat.user.name}</h3>
                    <span className="online-status">Online</span>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map(msg => {
                  const isMe = msg.sender._id === currentUser._id;
                  return (
                    <div key={msg._id} className={`message-wrapper ${isMe ? 'mine' : 'theirs'}`}>
                      <div className="message-bubble">
                        <p>{msg.content}</p>
                        <div className="message-footer">
                          <span className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <FaCheckDouble className={`message-status ${msg.read ? 'read' : ''}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  required
                />
                <button type="submit" className="send-btn">
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <FaPaperPlane />
              <h2>Select a conversation</h2>
              <p>Choose a match to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;