import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Bell, 
  Search, 
  Send, 
  Paperclip, 
  CheckCheck, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { user, token, notifications, unreadCount, markAllNotificationsRead } = useAuth();
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'notifications'
  
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const [searchConv, setSearchConv] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !selectedConv) {
          setSelectedConv(data.conversations[0]);
          loadMessages(data.conversations[0].conversationId);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await fetch(`/api/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSelectConv = (conv) => {
    setSelectedConv(conv);
    loadMessages(conv.conversationId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !selectedConv) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedConv.conversationId,
          receiverId: selectedConv.otherUserId,
          text: newText
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewText('');
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.otherUser?.name?.toLowerCase().includes(searchConv.toLowerCase()) ||
    c.lastMessage?.text?.toLowerCase().includes(searchConv.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header & Tab Toggle */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Communications & Alerts</h1>
          <p className="text-xs text-slate-300 mt-0.5">Manage live discussions with creators, clients, and platform notifications.</p>
        </div>

        <div className="flex rounded-2xl bg-navy-900 p-1 border border-purple-900/40 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'messages' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Messages ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Notifications
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'messages' ? (
        /* Messages Layout */
        <div className="glass-card rounded-2xl border border-purple-900/40 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[680px]">
          
          {/* Left Sidebar: Conversations List */}
          <div className="md:col-span-4 border-r border-purple-900/30 flex flex-col bg-navy-950/60">
            <div className="p-3 border-b border-purple-900/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter conversations..."
                  value={searchConv}
                  onChange={(e) => setSearchConv(e.target.value)}
                  className="w-full bg-navy-900 border border-purple-900/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-purple-900/20">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  No conversations active.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConv?.conversationId === conv.conversationId;
                  return (
                    <div
                      key={conv.conversationId}
                      onClick={() => handleSelectConv(conv)}
                      className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        isSelected ? 'bg-purple-950/60 border-l-2 border-purple-400' : 'hover:bg-purple-950/20'
                      }`}
                    >
                      <img
                        src={conv.otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={conv.otherUser?.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-purple-500/30 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{conv.otherUser?.name}</h4>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(conv.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {conv.lastMessage?.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Area: Selected Conversation Thread */}
          <div className="md:col-span-8 flex flex-col bg-navy-900/30">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-purple-900/30 bg-navy-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConv.otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={selectedConv.otherUser?.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-white">{selectedConv.otherUser?.name}</h3>
                      <p className="text-[10px] text-purple-300 font-medium">
                        {selectedConv.otherUser?.title || 'NexusAI Verified Member'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">● Online</span>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3">
                  {messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id || m._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-500 mb-0.5 px-1">{m.senderName}</span>
                        <div
                          className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                            isMe
                              ? 'bg-purple-600 text-white rounded-br-none shadow-glow-sm'
                              : 'bg-navy-950/90 border border-purple-900/40 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {m.text}
                          {m.attachment && (
                            <div className="mt-2 pt-2 border-t border-purple-400/30 text-[11px] font-mono flex items-center gap-1 text-purple-200">
                              <Paperclip className="w-3 h-3" /> {m.attachment.name}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-purple-900/30 bg-navy-950 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="flex-1 bg-navy-900 border border-purple-900/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl purple-glow-btn text-white transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Select a conversation from the left to view messages.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Notifications Tab */
        <div className="glass-card rounded-2xl border border-purple-900/40 p-6 space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" /> Platform Notifications & Alerts
            </h2>
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-purple-300 hover:text-purple-200 font-semibold"
            >
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-purple-900/20">
            {notifications.map((n) => (
              <div key={n.id} className="py-4 flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${
                  n.type === 'project'
                    ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                    : n.type === 'ai'
                    ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-900/30 text-amber-300 border border-amber-500/30'
                }`}>
                  {n.type === 'project' && <Clock className="w-4 h-4" />}
                  {n.type === 'ai' && <ShieldCheck className="w-4 h-4" />}
                  {n.type === 'payment' && <DollarSign className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-bold ${n.read ? 'text-slate-300' : 'text-purple-300'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
