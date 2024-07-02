import axios from 'axios';

export const checkToken = async () => {
  const API_URL = process.env.REACT_APP_API_URL;

  try {
    const token = localStorage.getItem('jwt');

    const response = await axios.get(`${API_URL}/api/v1/users/checkToken`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data.status === 'success';
  } catch (error) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      return false;
    } else if (error.request) {
      console.error('Network error:', error.request);
      return false;
    } else {
      console.error('Request error:', error.message);
      return false;
    }
  }
};
