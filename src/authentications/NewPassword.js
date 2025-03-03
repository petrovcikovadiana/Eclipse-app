import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';
import { LanguageSelect } from '../LanguageSelect';
import { Link } from 'react-router-dom';

function NewPassword() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslate();

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      navigate('/');
    }
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
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-gray-400/90 to-emerald-400/0 transition-opacity duration-500"></span>
            </button>
          </div>
          <div className="flex justify-start pl-5 pb-5">
            <LanguageSelect />
          </div>
        </div>

        <div className="absolute h-80 w-96 bg-black  rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-50  ">
          <div className="p-8 ">
            {' '}
            <h1 className="text-white text-4xl pb-2">New password</h1>
            <p className="text-white text-sm pb-5">
              Keep it all together and you'll be fine{' '}
            </p>
            <input
              type="text"
              placeholder="New email"
              className="bg-transparent border border-zinc-500 w-full mb-4 py-2 pl-2 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <input
              type="text"
              placeholder="Confirm new password"
              className="bg-transparent appearance-none border border-zinc-500 w-full mb-4 py-2 pl-2 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <button
              onClick={handleLogin}
              className="w-full px-2 py-2 bg-gradient-to-r from-[#7c2889] via-[#59277c]  to-[#2a1d54] rounded-lg text-white "
            >
              Save
            </button>
          </div>
        </div>
      </div>{' '}
    </>
  );
}

export default NewPassword;
