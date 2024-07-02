import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LanguageSelect } from '../LanguageSelect';
import { useTranslate } from '@tolgee/react';

function Signup() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({ password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const { t } = useTranslate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    if (token) {
      setToken(token);
      try {
        const decodedToken = jwtDecode(token);
        console.log('decoded token:', decodedToken);
        if (decodedToken.id) {
          fetchUserEmail(decodedToken.id, token);
        } else {
          console.error('User ID not found in the token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('Token not found in the URL');
    }
  }, [location]);

  const fetchUserEmail = async (userId, token) => {
    console.log(`Fetching email for user ID: ${userId} with token: ${token}`);
    try {
      const response = await axios.get(`${API_URL}/api/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data && response.data.data && response.data.data.user) {
        const email = response.data.data.user.email;
        console.log(`Fetched email: ${email}`);
        setFormData((prevFormData) => ({
          ...prevFormData,
          email: email,
        }));
      } else {
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(formData.password)) {
      setErrors({
        password:
          'Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character.',
      });
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrors({
        password: 'Passwords do not match.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const encodedToken = encodeURIComponent(token);
      const response = await axios.post(
        `${API_URL}/api/v1/users/signup`,
        {
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${encodedToken}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setFormData({
          userName: '',
          email: '',
          password: '',
          passwordConfirm: '',
        });
        navigate('/login');
      } else {
        console.error(
          'Error creating user:',
          response.data.message || response.statusText
        );
      }
    } catch (error) {
      console.error('Axios error:', error);
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center  text-violet-300"
      style={{
        background: `url(${
          process.env.PUBLIC_URL + '/assets/jpg/background.jpg'
        })`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        opacity: '70',
      }}
    >
      <div className="absolute bottom-0 left-0 p-5">
        <LanguageSelect />
      </div>
      <div className="flex flex-col w-1/3 xxl:w-1/4 bg-black bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70 p-10 rounded-xl">
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {/* name */}
          <h1 className="text-lineGrey">
            {t('user_name')} <span className="text-red-500 ml-1">*</span>
          </h1>
          <input
            type="text"
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4"
            placeholder={t('user_name')}
            name="userName"
            onChange={handleInputChange}
            value={formData.userName}
          />

          {/* email */}
          <h1 className="text-lineGrey">
            {t('email')} <span className="text-red-500 ml-1">*</span>
          </h1>
          <input
            type="text"
            className="rounded-lg bg-midnightBlue text-white py-2 w-full px-4"
            placeholder={t('email')}
            name="email"
            value={formData.email}
            disabled
          />

          {/* password */}
          <h1 className="text-lineGrey">
            {t('password')} <span className="text-red-500 ml-1">*</span>
          </h1>

          <input
            type="password"
            name="password"
            placeholder={t('password')}
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4 mb-2"
            onChange={handleInputChange}
            value={formData.password}
          />
          <p className="text-logoRed text-[12px]">{t('valid_password')}</p>
          {/* confirm password */}
          <h1 className="text-lineGrey">
            {t('confirm_password')} <span className="text-red-500 ml-1">*</span>
          </h1>
          <input
            type="password"
            name="passwordConfirm"
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4"
            placeholder={t('confirm_password')}
            value={formData.passwordConfirm}
            onChange={handleInputChange}
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
          <div className="flex justify-center items-center">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <input
                type="submit"
                value={t('login_button')}
                className="md:mt-6 bg-buttonBlue text-white py-2 rounded-lg w-24 items-center justify-center mx-auto"
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
