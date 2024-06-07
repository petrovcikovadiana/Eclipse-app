import React, { useState } from 'react';
import { useTranslate } from '@tolgee/react';

function Users() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsOpen(false);
  };
  const { t } = useTranslate();

  return (
    <div className="w-full h-screen">
      <div className="flex flex-row gap-10  bg-cards p-10 rounded-lg ">
        <div>
          <div className="flex flex-row gap-44 mx-auto justify-center">
            <div className="flex flex-col text-white gap-5">
              {' '}
              <h1 className="font-bold">{t('title')}</h1>
              <h2>Diana Petrovčíková</h2>
            </div>
            <div className="flex flex-col text-white gap-5">
              {' '}
              <h1 className="font-bold">Email</h1>
              <h2>diana.petrovcikova@gmail.com</h2>
            </div>
            <div className="flex flex-col text-white gap-5">
              {' '}
              <div>
                <h1 className="font-bold">Role</h1>
              </div>
              {/* dropdown button */}
              <div className="relative">
                <button
                  id="dropdownDefaultButton"
                  className="text-white bg-gradient-to-r from-[#7c2889] via-[#59277c]  to-[#2a1d54] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-buttonPink dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={toggleDropdown}
                  type="button"
                >
                  {selectedRole}{' '}
                  <svg
                    className={`w-2.5 h-2.5 ms-3 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                    xmlns="https://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                  <div
                    id="dropdown"
                    className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 absolute top-full left-0 mt-1"
                  >
                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={() => handleRoleSelect('Admin')}
                        >
                          Admin
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={() => handleRoleSelect('Editor')}
                        >
                          Editor
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={() => handleRoleSelect('Read')}
                        >
                          Read
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
