import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';
import { LanguageSelect } from '../LanguageSelect';
import { checkToken } from './auth'; // Importujte funkci pro ověření tokenu
import axios from 'axios'; // Import axios
import { UserContext } from '../components/UserContext';
import { ClipLoader } from 'react-spinners';

function Login() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/users/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        localStorage.setItem('jwt', response.data.token);

        setUser(response.data.data.user);

        const isValidToken = await checkToken();
        if (isValidToken) {
          navigate('/');
        } else {
          console.error('Invalid token after login.');
        }
      } else {
        console.error('Error logging in:', response.statusText);
      }
    } catch (error) {
      console.error('Axios error:', error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <div
        className="relative h-screen w-full flex justify-center items-center pt-20 md:pt-0"
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
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="flex justify-start items-start p-5">
            <button className="relative inline-block p-px font-semibold leading-6 text-white no-underline bg-gray-800 shadow-2xl cursor-pointer group rounded-xl shadow-zinc-900">
              <span className="absolute inset-0 overflow-hidden rounded-xl">
                <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
              </span>
              <div className="relative animate-pulse z-10 flex items-center px-6 py-3 space-x-2 rounded-xl bg-black ring-1 ring-white/10">
                <span>ECLIPSE by CloudyLake.io</span>
              </div>
            </button>
          </div>
          <div className="flex justify-start pl-5 pb-5">
            <LanguageSelect />
          </div>
        </div>

        <form
          className="absolute h-[450px] w-96 bg-black  rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-50"
          onSubmit={handleLogin}
        >
          <div className="p-8 my-5">
            {' '}
            <h1 className="text-white text-4xl pb-2">{t('login_button')}</h1>
            <p className="text-white text-sm pb-5">
              Keep it all together and you'll be fine{' '}
            </p>
            <input
              type="text"
              placeholder="Email"
              className="bg-transparent border border-zinc-500 w-full mb-4 py-2 pl-2 text-white"
              onChange={handleInputChange}
              value={formData.email}
              name="email"
            />
            <input
              type="password"
              placeholder={t('password')}
              className="bg-transparent appearance-none border border-zinc-500 w-full mb-4 py-2 pl-2 text-white"
              onChange={handleInputChange}
              value={formData.password}
              name="password"
            />
            <input
              type="submit"
              value={t('login_button')}
              className="w-full px-2 py-2 bg-gradient-to-r from-[#7c2889] via-[#59277c]  to-[#2a1d54] rounded-lg text-white "
            />
            {isLoading && (
              <div className="flex justify-center items-center mt-4">
                <ClipLoader color="#ffffff" loading={isLoading} size={35} />
              </div>
            )}
          </div>
        </form>
      </div>{' '}
    </>
  );
}

export default Login;
