import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { sendMessage as sendMessageApi } from "../api/messageApi.js";
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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch messages and setup socket when the currentUser is set
  useEffect(() => {
    if (!currentUser) return;

    const initChat = async () => {
      try {
        const fetchedMessages = await getMessages(currentUser._id, userId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    initChat();
    connectSocket(currentUser._id);

    receiveMessage((newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    receiveOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    return () => {
      disconnectSocket();
    };
  }, [currentUser, userId]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    const newMessage = {
      sender: currentUser._id,
      receiver: userId,
      content: message,
    };

    try {
      console.log("Sending message:", newMessage); // Add logging for debugging
      await sendMessageApi(newMessage); // Send to the backend via API
      sendSocketMessage(newMessage); // Send via socket
      setMessages((prev) => [...prev, newMessage]); // Update UI with the new message
      setMessage(""); // Clear the input
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search for users", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h3>Online Users</h3>
        {onlineUsers.map((user) => (
          <div key={user._id} className="online-user">
            {user.name}
          </div>
        ))}

        {/* Search functionality */}
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
              <div
                key={user._id}
                className="search-result"
                onClick={() => setMessages([])}
              >
                <p>{user.name}</p>
                {/* On click, initiate a new chat with the selected user */}
                <button onClick={() => setMessages([])}>Start Chat</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-box">
        <div className="chat-header">Chat with {userId}</div>

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
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat; 
