import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const useUserEmail = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [email, setEmail] = useState('');
  const token = localStorage.getItem('jwt');

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const fetchUserEmail = async (userId) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/v1/users/${userId}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`, // Přidejte token do hlaviček
                },
                withCredentials: true, // Zahrnout cookies do požadavku
              }
            );

            if (
              response.data &&
              response.data.data &&
              response.data.data.user
            ) {
              setEmail(response.data.data.user.email);
            } else {
              console.error('Unexpected data format:', response.data);
            }
          } catch (error) {
            console.error('Error fetching user email:', error);
          }
        };

        fetchUserEmail(userId);
      } catch (error) {
        console.error('Invalid JWT token:', error);
      }
    } else {
      console.error('No JWT token found in cookies.');
    }
  }, [token, API_URL]);

  return email;
};

export default useUserEmail;
