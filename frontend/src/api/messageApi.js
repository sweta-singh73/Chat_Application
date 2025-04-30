import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages';

export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(`${API_URL}/send`, messageData);
    return response.data;
  } catch (error) {
    console.error('Message sending failed', error);
    throw error;
  }
};

export const getMessages = async (userId, otherUserId) => {
  try {
    const response = await axios.get(`${API_URL}/history`, {
      params: { userId, otherUserId },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch message history', error);
    throw error;
  }
};
