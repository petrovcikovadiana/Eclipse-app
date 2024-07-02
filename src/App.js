import React, { useEffect, useState, useContext } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import Login from './authentications/Login';
import { useTranslate } from '@tolgee/react';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { LuClock, LuFileText } from 'react-icons/lu';
import axios from 'axios';
import { LuHome } from 'react-icons/lu';

import Users from './pages/Side-menu/Users';
import Hours from './pages/Side-menu/Hours';
import Tenants from './pages/Side-menu/Tenants';
import Home from './pages/Side-menu/Home';
import ResetPassword from './authentications/ResetPassword';
import NewPassword from './authentications/NewPassword';
import ProtectedRoute from './authentications/ProtectedRoute';
import PostContent from './pages/Side-menu/PostContent';
import Signup from './authentications/Signup';

import Hero from './pages/Side-menu/Hero';
import { Outlet } from 'react-router-dom';
import { LanguageSelect } from './LanguageSelect';
import { jwtDecode } from 'jwt-decode';
import useUserEmail from './pages/Side-menu/useUserEmail';
import { UserProvider } from './components/UserContext';
import { UserContext } from './components/UserContext';
import MenuItem from './components/MenuItem';
import Configs from './pages/Side-menu/Configs';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';

function App() {
  return (
    <UserProvider>
      <Router>
        <ScrollLock />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/newpassword" element={<NewPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Hero />} />
              <Route path="/posts" element={<PostContent />} />
              <Route path="/hours" element={<Hours />} />
              <Route path="/users" element={<Users />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/configs" element={<Configs />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

function ScrollLock() {
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname === '/' ||
      location.pathname === '/login' ||
      location.pathname === '/signup' ||
      location.pathname === '/posts' ||
      location.pathname === '/users' ||
      location.pathname === '/tenants'
    ) {
      document.body.classList.add('lock-scroll');
    } else {
      document.body.classList.remove('lock-scroll');
    }
  }, [location.pathname]);

  return null;
}

const MainLayout = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [menuOpen, setMenuOpen] = useState(false);

  const [userRole, setUserRole] = useState(null);
  const { user } = useContext(UserContext);
  const email = useUserEmail();
  const { t } = useTranslate();
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuItemClick = () => {
    setMenuOpen(false);
  };

  // odhlaseni
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const fetchUserRole = async (userId) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/v1/users/${userId}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                withCredentials: true, // Zahrnout cookies do požadavku
              }
            );
            if (
              response.status === 200 &&
              response.data.data &&
              response.data.data.user
            ) {
              setUserRole(response.data.data.user.role);
            } else {
              console.error('Unexpected data format:', response.data);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        };

        fetchUserRole(userId);
      } catch (error) {
        console.error('Invalid JWT token:', error);
      }
    }
  }, []);

  // polozky v menu
  const menuItems = [
    {
      label: t('posts_item'),
      icon: <LuFileText />,
      value: 'posts',
      path: '/posts',
      roles: ['super-admin', 'admin', 'manager', 'editor', 'user'],
    },
    {
      label: t('opening_hours_item'),
      icon: <LuClock />,
      value: 'hours',
      path: '/hours',
      roles: ['super-admin', 'admin', 'manager', 'editor', 'user'],
    },
    {
      label: t('user_management_item'),
      icon: <AiOutlineUsergroupAdd />,
      value: 'users',
      path: '/users',
      roles: ['super-admin', 'admin', 'manager', 'editor', 'user'],
    },
    {
      label: t('tenants_item'),
      icon: <HiOutlineBuildingOffice2 />,
      value: 'tenants',
      path: '/tenants',
      roles: ['super-admin', 'admin'],
    },
    {
      label: t('configs_item'),
      icon: <HiOutlineBuildingOffice2 />,
      value: 'configs',
      path: '/configs',
      roles: ['super-admin', 'admin'],
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="md:w-64 bg-container text-white pt-5 flex flex-col">
        <div className="flex flex-row items-center justify-center md:justify-start gap-3 pl-5">
          <Link to="/">
            <img
              src={process.env.PUBLIC_URL + '/assets/svg/eclipse.svg'}
              alt="eclipse"
            />
          </Link>

          <button className="relative inline-block p-px font-semibold leading-6 text-white no-underline shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900">
            <span className="absolute inset-0 overflow-hidden rounded-xl">
              <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
            </span>
            <Link to="/">
              <div className="relative z-10 text-sm flex items-center px-3 py-2 space-x-2 rounded-xl">
                <p>ECLIPSE</p>
              </div>
            </Link>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] transition-opacity duration-500 group-hover:opacity-40"></span>
          </button>
          <button onClick={handleMenuToggle} className="md:hidden">
            {menuOpen ? (
              <AiOutlineClose size={24} />
            ) : (
              <AiOutlineMenu size={24} />
            )}
          </button>
        </div>
        <div
          className={`flex-col flex-grow ${
            menuOpen ? 'flex' : 'hidden'
          } md:flex`}
        >
          <h1 className="font-bold pb-4 pl-5 pt-3 p-2 text-miniText">
            {t('overview')}
          </h1>
          <ul className="flex flex-col px-3">
            <Link to="/" onClick={handleMenuToggle}>
              <li className="flex flex-row items-center gap-3 p-2  cursor-pointer hover:bg-buttonHover hover:text-textHover hover:rounded-full">
                <LuHome />
                <p>Home</p>
              </li>

              {menuItems.map((item) =>
                userRole && item.roles.includes(userRole) ? (
                  <MenuItem
                    key={item.value}
                    path={item.path}
                    icon={item.icon}
                    onClick={handleMenuToggle}
                  >
                    {item.label}
                  </MenuItem>
                ) : null
              )}
            </Link>
          </ul>

          <div className="md:mt-auto flex flex-col items-center justify-center mx-auto p-5 ">
            <LanguageSelect />
            <div className="p-4 text-white">
              <button className="text-textHover pointer-events-none bg-buttonHover text-sm px-2 py-1 rounded-xl">
                {email ? <span>{email}</span> : 'Not logged in'}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="text-textGrey text-sm hover:text-white cursor-pointer"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
      <div className="w-full min-h-screen bg-newBackground md:px-20 mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
