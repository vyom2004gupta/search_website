import { io } from 'socket.io-client';
try {
  console.log('typeof io at top:', typeof io);
  window._io = io; // Attach to window for manual testing
} catch (e) {
  console.error('io import error:', e);
}
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const API_BASE_URL = 'http://localhost:5002';

const ChatPage = () => {
  console.log('ChatPage mounted');
  const { user, isSignedIn } = useUser();
  const { userId } = useParams(); // Google Sheet ID of the person to chat with
  const navigate = useNavigate();
  const [myProfile, setMyProfile] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileCheck, setProfileCheck] = useState('checking'); // 'checking', 'notfound', 'found'
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Check if my email exists in Google Sheets
  useEffect(() => {
    if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return;
    const checkProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/check_profile_exists?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`);
        const data = await res.json();
        if (data.exists) {
          setProfileCheck('found');
        } else {
          setProfileCheck('notfound');
        }
      } catch (err) {
        setProfileCheck('notfound');
        setError('Failed to check your profile.');
      }
    };
    checkProfile();
  }, [isSignedIn, user]);

  // Fetch my profile and other user's profile
  useEffect(() => {
    if (profileCheck !== 'found' || !user?.primaryEmailAddress?.emailAddress) return;
    const fetchProfiles = async () => {
      try {
        // Fetch my profile
        const res1 = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`);
        const data1 = await res1.json();
        if (!Array.isArray(data1)) throw new Error(data1.error || 'Failed to fetch your profile.');
        const myProf = data1.find(p => p.email && p.email.trim().toLowerCase() === user.primaryEmailAddress.emailAddress.trim().toLowerCase());
        console.log('Fetched my profile:', myProf);
        setMyProfile(myProf || null);
        // Fetch other user's profile by ID
        const res2 = await fetch(`${API_BASE_URL}/api/search?q=`);
        const data2 = await res2.json();
        if (!Array.isArray(data2)) throw new Error(data2.error || 'Failed to fetch the other user profile.');
        const otherProf = data2.find(p => p.id === userId);
        console.log('Fetched other profile:', otherProf);
        setOtherProfile(otherProf || null);
        if (!myProf) setError('Your profile was not found in Google Sheets. Please add your details.');
        else if (!otherProf) setError('The other user profile was not found.');
      } catch (err) {
        setError(err.message || 'Failed to load profiles.');
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [profileCheck, user, userId]);

  // Fetch chat history and connect to Socket.IO
  useEffect(() => {
    if (!myProfile || !otherProfile) return;
    setLoading(true);
    let isMounted = true;
    // Fetch chat history
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat_history?user1=${myProfile.id}&user2=${userId}`);
        const data = await res.json();
        if (isMounted) {
          setMessages(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load chat history.');
        setLoading(false);
      }
    };
    fetchHistory();
    // Connect to Socket.IO using window._io
    const roomName = [myProfile.id, userId].sort().join(':');
    console.log('Connecting to Socket.IO using window._io...');
    socketRef.current = window._io(API_BASE_URL);
    console.log('Socket.IO instance:', socketRef.current);
    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected!', socketRef.current.id);
    });
    console.log('Joining room:', { user1: myProfile.id, user2: userId, room: roomName });
    socketRef.current.emit('join_room', { user1: myProfile.id, user2: userId });
    socketRef.current.on('joined_room', (data) => {
      console.log('Joined room:', data);
    });
    socketRef.current.on('receive_message', (msg) => {
      console.log('Received message:', msg);
      if ((msg.sender_id === myProfile.id && msg.receiver_id === userId) || (msg.sender_id === userId && msg.receiver_id === myProfile.id)) {
        setMessages(prev => [...prev, msg]);
      }
    });
    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connect error:', err);
    });
    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [myProfile, otherProfile, userId]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !myProfile || !userId) return;
    const msg = {
      sender_id: myProfile.id,
      receiver_id: userId,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };
    console.log('Sending message:', msg);
    socketRef.current.emit('send_message', msg);
    setInput('');
  };

  if (profileCheck === 'checking') {
    return <div className="chat-page"><div className="chat-box"><h2>Checking profile...</h2></div></div>;
  }
  if (profileCheck === 'notfound') {
    return (
      <div className="chat-page">
        <div className="chat-box">
          <h2 style={{ color: '#00c6ff' }}>Add Your Details First</h2>
          <p style={{ color: '#fff' }}>You need to add your details before you can chat.</p>
          <button className="add-details-btn" onClick={() => navigate('/')}>Go to Add Your Details</button>
        </div>
        <style>{`
          .add-details-btn { background: #00c6ff; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; margin-top: 1rem; cursor: pointer; }
          .add-details-btn:hover { background: #0072ff; }
        `}</style>
      </div>
    );
  }
  if (error) {
    return (
      <div className="chat-page">
        <div className="chat-box">
          <h2 style={{ color: 'red' }}>Error</h2>
          <p style={{ color: '#fff' }}>{error}</p>
          {error.includes('add your details') && (
            <button className="add-details-btn" onClick={() => navigate('/')}>Go to Add Your Details</button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="chat-page">
      <div className="chat-box">
        <h2 style={{ color: '#00c6ff' }}>Chat with {otherProfile ? otherProfile.name : userId}</h2>
        <div className="chat-history" style={{ maxHeight: 300, minHeight: 200, overflowY: 'auto', marginBottom: 16, background: '#222', padding: 8, borderRadius: 8 }}>
          {error ? <div style={{ color: 'red' }}>{error}</div> :
            loading ? <div>Loading...</div> :
            messages.length === 0 ? <div>No messages yet.</div> :
            messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.sender_id === myProfile?.id ? 'right' : 'left', margin: '8px 0' }}>
                <span style={{ background: msg.sender_id === myProfile?.id ? '#00c6ff' : '#444', color: '#fff', padding: '6px 12px', borderRadius: 16, display: 'inline-block' }}>{msg.message}</span>
                <div style={{ fontSize: 10, color: '#aaa' }}>{new Date(msg.timestamp).toLocaleString()}</div>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            placeholder="Type a message..."
            style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #333', background: '#181a1b', color: '#fff' }}
            disabled={!myProfile}
          />
          <button onClick={handleSend} disabled={!input.trim() || !myProfile} style={{ background: '#00c6ff', color: '#fff', border: 'none', borderRadius: 8, padding: '0 1.5rem', fontWeight: 600, fontSize: '1.1rem' }}>Send</button>
        </div>
      </div>
      <style>{`
        .chat-page { min-height: 100vh; background: #111; display: flex; align-items: center; justify-content: center; }
        .chat-box { background: #181a1b; border-radius: 24px; padding: 2rem; min-width: 400px; max-width: 95vw; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .chat-box h2 { margin-bottom: 1rem; }
        .chat-history { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
};

export default ChatPage; 