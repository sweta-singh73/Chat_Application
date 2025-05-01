import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users'; 

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    console.log("response", response)
    return response.data;
  } catch (error) {
    console.error('Login failed', error);
    throw error;
  }
};

export const searchUsers = async (searchQuery) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { params: { search: searchQuery } });
    return response.data;
  } catch (error) {
    console.error('Search failed', error);
    throw error;
  }
};
