import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  sendMessage as sendMessageApi,
  getMessages,
} from "../api/messageApi.js";
import { searchUsers } from "../api/userApi.js";
import {
  connectSocket,
  sendMessage as sendSocketMessage,
  receiveMessage,
  receiveOnlineUsers,
  disconnectSocket,
} from "../utils/socket.js";
import "../Chat.css";

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatWith, setChatWith] = useState(userId || null);
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    connectSocket(currentUser._id);

    receiveMessage((newMessage) => {
      if (
        (newMessage.sender === currentUser._id &&
          newMessage.receiver === chatWith) ||
        (newMessage.sender === chatWith &&
          newMessage.receiver === currentUser._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    receiveOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return () => {
      disconnectSocket();
    };
  }, [currentUser, chatWith]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser || !chatWith) return;
      try {
        const msgs = await getMessages(currentUser._id, chatWith);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [chatWith, currentUser]);

  useEffect(() => {
    const loadUserFromParam = async () => {
      if (!userId || !currentUser) return;
      try {
        const results = await searchUsers(""); // fetch all
        const user = results.find((u) => u._id === userId);
        if (user) {
          setChatUser(user);
          setChatWith(userId);
        }
      } catch (err) {
        console.error("Failed to find user:", err);
      }
    };

    loadUserFromParam();
  }, [userId, currentUser]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !chatWith) return;

    const newMessage = {
      sender: currentUser._id,
      receiver: chatWith,
      content: message,
    };

    try {
      await sendMessageApi(newMessage);
      sendSocketMessage({
        from: currentUser._id,
        to: chatWith,
        content: message,
      });
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter((user) => user._id !== currentUser._id));
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  const startChatWithUser = (user) => {
    setChatUser(user);
    setChatWith(user._id);
    setMessages([]);
    setSearchResults([]);
    setSearchQuery("");
    navigate(`/chat/${user._id}`);
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="current-user-info">
          {currentUser && (
            <>
              <div className="user-icon">👤</div>
              <div className="username">{currentUser.name}</div>
            </>
          )}
        </div>

        <h4>Online Users</h4>
        {onlineUsers
          .filter((user) => user._id !== currentUser?._id)
          .map((user) => (
            <div
              key={user._id}
              className="online-user clickable"
              onClick={() => startChatWithUser(user)}
            >
              🟢 {user.name}
            </div>
          ))}

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h4>Search Results</h4>
            {searchResults.map((user) => (
              <div key={user._id} className="search-result">
                <p>{user.name}</p>
                <button onClick={() => startChatWithUser(user)}>
                  Start Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-box">
        <div className="chat-header">
          {chatUser ? `Chat with ${chatUser.name}` : "Select a user to start chat"}
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === currentUser?._id
                  ? "message-right"
                  : "message-left"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!chatWith}
          />
          <button onClick={handleSendMessage} disabled={!chatWith}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
