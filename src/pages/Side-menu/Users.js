import React, { useState, useEffect, useRef } from 'react';
import { useTranslate } from '@tolgee/react';
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { IoCloseOutline } from 'react-icons/io5';
import Cookies from 'js-cookie';
import EmailsInput from '../../authentications/EmailIsInput';
import axios from 'axios';
import { IoMdEye } from 'react-icons/io';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '700px',
  p: 4,
  borderRadius: '10px',
};

// Map role to colors
const roleColors = {
  'super-admin': 'bg-[#445d4e] text-[#6dd879]',
  admin: 'bg-[#373544] text-[#af6dd8]',
  manager: 'bg-[#323844] text-[#5b68f3]  ',
  editor: 'bg-[#393a3d] text-[#f3af5b]  ',
  user: 'bg-[#443237] text-[#f35b72] ',
};

function Users({ onDeletePost, onEditPost }) {
  const emailsInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL;

  const token = localStorage.getItem('jwt');

  // State variables
  const [users, setUsers] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userToDelete, setUserToDelete] = useState(null);
  const [roles, setRoles] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState('');

  const [sortBy, setSortBy] = useState('desc');
  const [isDescending, setIsDescending] = useState(false);
  const dropdownRefs = useRef({});
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [allRoles, setAllRoles] = useState([]);

  const { t } = useTranslate();

  // Modal handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //kliknuti mimo dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        dropdownRefs.current[dropdownOpen] &&
        !dropdownRefs.current[dropdownOpen].contains(event.target) &&
        !event.target.closest(`[data-user-id="${dropdownOpen}"]`)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, dropdownRefs]);

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const token = localStorage.getItem('jwt');

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await axios.get(`${API_URL}/api/v1/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (response.data && response.data.data && response.data.data.user) {
          setCurrentUserRole(response.data.data.user.role);
        }
      } catch (error) {
        console.error('Error fetching current user role:', error);
      }
    };

    fetchCurrentUserRole();
  }, []);

  // Fetch roles by user ID
  const fetchRoles = async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/users/roles/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      let roles = response.data.roles;

      // Pokud je aktuální role uživatele super-admin, zobrazte všechny role
      if (currentUserRole === 'super-admin') {
        roles = ['super-admin', 'admin', 'manager', 'editor', 'user'];
      } else if (currentUserRole === 'admin') {
        roles = ['admin', 'manager', 'editor', 'user'];
      } else if (currentUserRole === 'manager') {
        roles = ['manager', 'editor', 'user'];
      } else {
        roles = getFilteredRoles(currentUserRole, roles);
      }

      setAllRoles((prevRoles) => ({
        ...prevRoles,
        [userId]: roles,
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = async (userId) => {
    setDropdownOpen((prevDropdownOpen) =>
      prevDropdownOpen === userId ? null : userId
    );

    if (currentUserRole === 'editor' || currentUserRole === 'user') {
      return;
    }

    if (dropdownOpen === userId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(userId);
      await fetchRoles(userId);
    }
  };

  // get all users

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/users/tenant`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // Zahrnout cookies do požadavku
      });
      if (response.data && response.data.data && response.data.data.users) {
        setUsers(response.data.data.users);
      } else {
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Fetch user by ID
  const fetchUserById = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // Zahrnout cookies do požadavku
      });

      setSelectedUser(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Sort users by title
  const sortByTitle = () => {
    const sortedUsers = [...users];
    sortedUsers.sort((a, b) =>
      isDescending
        ? b.userName.localeCompare(a.userName)
        : a.userName.localeCompare(b.userName)
    );
    setUsers(sortedUsers);
    setIsDescending(!isDescending);
  };

  // Show delete confirmation dialog
  const showDeleteConfirmationDialog = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirmation(true);
  };

  // Confirm user deletion
  const confirmDeleteUser = () => {
    handleDeleteUser(userToDelete);
    setShowDeleteConfirmation(false);
  };

  // Cancel user deletion
  const cancelDeleteUser = () => {
    setShowDeleteConfirmation(false);
  };

  // delete a user from the
  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/v1/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success('User deleted successfully.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting user.');
    }
  };

  // Handle role selection-patch role
  const handleRoleSelect = async (userId, role) => {
    if (
      (currentUserRole === 'admin' && role === 'super-admin') ||
      (currentUserRole === 'manager' &&
        (role === 'super-admin' || role === 'admin')) ||
      currentUserRole === 'editor' ||
      currentUserRole === 'user'
    ) {
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/users/${userId}`,
        { role },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role } : user
          )
        );
        toast.success('Role changed successfully.');
      } else {
        console.error('Error updating role:', response.data);
        toast.error('Error updating role.');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }

    setDropdownOpen(null);
  };

  const getFilteredRoles = (currentUserRole, roles) => {
    if (currentUserRole === 'super-admin') {
      return roles;
    } else if (currentUserRole === 'admin') {
      return roles.filter((role) => role !== 'super-admin');
    } else if (currentUserRole === 'manager') {
      return roles.filter((role) =>
        ['manager', 'editor', 'user'].includes(role)
      );
    }
    return [];
  };

  // Handle email input change
  const handleEmailsChange = (emails) => {
    setEmails(emails);
  };

  const handleInvite = async () => {
    if (emailsInputRef.current) {
      // Zavolejte funkci addEmail pro přidání posledního emailu
      emailsInputRef.current.addEmail();
    }
    // Convert array of emails to a comma-separated string
    const emailString = emails.join(', ');

    if (emailString === '') {
      alert('Please enter a valid email address.');
      return;
    }

    const apiUrl = `${API_URL}/api/v1/users/invite`;

    try {
      const response = await axios.post(
        apiUrl,
        { email: emailString },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.status === 'success') {
        toast.success('Invitations sent successfully.');
        handleClose();
        fetchUsers();
      } else {
        console.error('Error response from server:', response.data);
        toast.error('Failed to send invitations');
        throw new Error('Failed to send invitations');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      console.error('Request data:', { email: emailString });
      alert(
        'There was an error sending invitations. Please check the console for more details.'
      );
    }
  };

  return (
    <>
      <div className="flex flex-col md:gap-6 md:items-center items-center relative bg-newBackground h-auto mx-auto w-full xl:w-3/4 ">
        <ToastContainer
          theme="colored"
          position="top-right"
          autoClose={3000}
          hideProgressBar
        />

        <div className="flex flex-col gap-6 md:items-start items-center relative bg-container rounded-lg h-auto p-5 xl:p-10">
          <button
            onClick={handleOpen}
            className=" inline-block font-semibold leading-6 px-3 py-2 bg-buttonBlue text-sm z-10 text-white no-underline  cursor-pointer rounded-xl  mb-5 md:mb-0"
          >
            + {t('tenant_invite')}
          </button>
          {/* Delete confirmation dialog */}
          <AnimatePresence>
            {showDeleteConfirmation && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center ring-1 ring-buttonBlue/30 p-10 rounded-lg bg-zinc-100 backdrop-filter backdrop-blur-md bg-opacity-10"
                >
                  <h1 className="text-white font-bold text-xl mb-3">
                    {t('delete_post')}
                  </h1>
                  <p className="text-white text-lg">
                    {t('delete_post_prompt')}
                  </p>
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={confirmDeleteUser}
                      className="relative mr-4 inline-block p-px font-semibold leading-6 text-white no-underline shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900"
                    >
                      <span className="absolute inset-0 overflow-hidden rounded-xl">
                        <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                      </span>
                      <div className="relative z-10 text-md flex items-center px-3 py-2 space-x-2 rounded-lg bg-buttonBlue">
                        <p>{t('yes')}</p>
                      </div>
                      <span className="absolute -bottom-0 left-[1.125rem)] transition-opacity duration-500 group-hover:opacity-40"></span>
                    </button>
                    <button className="text-white" onClick={cancelDeleteUser}>
                      {t('no')}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {isLoading ? (
            <div className="flex justify-center items-center bg-container rounded-lg p-10 w-full xl:w-3/4 mx-auto">
              <ClipLoader color={'#123abc'} loading={isLoading} size={50} />
            </div>
          ) : (
            <div className="flex md:justify-between">
              <div className="flex flex-row justify-between items-center gap-6 text-white">
                <div className="flex flex-row ">
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center justify-between w-full pb-5">
                      <div
                        onClick={sortByTitle}
                        className="flex flex-row gap-2 justify-center items-center cursor-pointer w-20 md:w-32 xl:w-44 text-center"
                      >
                        <h1 className="font-bold text-lineGrey text-sm">
                          {t('user_name')}
                        </h1>
                        {isDescending ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </div>
                      <div className="flex flex-row text-white text-sm w-20 md:w-32 xl:w-44 items-center justify-center text-center">
                        <h1 className=" text-lineGrey font-bold text-sm">
                          {t('email')}
                        </h1>
                      </div>
                      <div className="flex flex-row gap-2 justify-center items-center w-20 md:w-32 xl:w-44 text-center">
                        <h1 className="font-bold text-lineGrey text-sm cursor-pointer">
                          {t('user_role')}
                        </h1>
                      </div>
                      <div className="flex flex-row w-20 md:w-32 xl:w-44 md:gap-4">
                        <div className="w-7 h-7"></div>{' '}
                        {/* Placeholder for edit icon */}
                        <div className="w-7 h-7"></div>{' '}
                        {/* Placeholder for delete icon */}
                      </div>
                    </div>
                    <div>
                      <hr className="h-0.5 w-full  border-t-0 bg-neutral-100 dark:bg-white/10" />
                    </div>
                    <div className="flex flex-col md:gap-4 gap-5 items-center my-5">
                      {users.map((user) => (
                        <React.Fragment key={user._id}>
                          <div className="flex flex-row items-center justify-between w-full gap-10 md:gap-0">
                            <p className="text-white text-sm w-20 md:w-32 xl:w-44 text-center">
                              {user.userName}
                            </p>
                            <p className="text-white text-sm py-2 w-20 md:w-32 xl:w-44 text-center">
                              {user.email}
                            </p>
                            <div className="w-20 md:w-32 xl:w-44 relative">
                              {dropdownOpen === user._id && (
                                <div
                                  ref={(el) =>
                                    (dropdownRefs.current[user._id] = el)
                                  }
                                  className="absolute top-full mt-2 w-40 bg-container border border-gray-700 rounded-xl shadow-xl z-10 left-1/2 transform -translate-x-1/2"
                                >
                                  {allRoles[user._id] &&
                                    allRoles[user._id].map((role) => (
                                      <div
                                        key={role}
                                        className="cursor-pointer px-4 py-2 hover:bg-buttonHover hover:rounded-full text-textHover"
                                        onClick={() =>
                                          handleRoleSelect(user._id, role)
                                        }
                                      >
                                        {role}
                                      </div>
                                    ))}
                                </div>
                              )}

                              <button
                                className={`text-sm py-1 w-24 ${
                                  roleColors[user.role]
                                } rounded-full items-center justify-center text-center mx-auto flex cursor-pointer gap-1 ${
                                  currentUserRole !== 'editor'
                                    ? 'cursor-pointer'
                                    : 'cursor-auto'
                                } `}
                                onClick={() => toggleDropdown(user._id)}
                                data-user-id={user._id}
                              >
                                {user.role}
                                {currentUserRole !== 'editor' &&
                                  currentUserRole !== 'user' && (
                                    <IoIosArrowDown />
                                  )}
                              </button>
                            </div>

                            <div className="flex flex-row md:gap-4 gap-2 w-20 md:w-32 xl:w-44 items-center justify-center">
                              <div className="bg-container w-7 h-7 border border-[#414144] rounded-md flex justify-center items-center">
                                <IoMdEye
                                  onClick={() => fetchUserById(user._id)}
                                  className="cursor-pointer text-white"
                                />
                              </div>
                              <div className="bg-container w-7 h-7 border border-[#414144] rounded-md flex justify-center items-center">
                                <RiDeleteBin6Line
                                  onClick={() =>
                                    showDeleteConfirmationDialog(user._id)
                                  }
                                  className="cursor-pointer text-logoRed"
                                />
                              </div>
                            </div>
                          </div>
                          <hr className="h-0.5 w-full border-t-0 bg-neutral-100 dark:bg-white/10" />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Modal invite */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <div className="fixed inset-0 flex items-center justify-center  ">
                <motion.div
                  className="absolute flex flex-col w-3/4 bg-container h-auto rounded-lg p-5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-end">
                    <div className="flex flex-row items-center gap-2 text-white">
                      <IoCloseOutline
                        className="hover:text-buttonViolet cursor-pointer"
                        onClick={handleClose}
                      />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-white font-semibold pb-5">Email</h1>
                    <EmailsInput
                      ref={emailsInputRef}
                      onChange={handleEmailsChange}
                    />
                  </div>
                  <div className="flex flex-row justify-end items-center pt-5 text-white">
                    <button
                      onClick={handleInvite}
                      type="button"
                      className="font-semibold text-white no-underline bg-buttonGreen cursor-pointer  px-3 py-2 rounded-lg"
                    >
                      <h1>{t('tenant_invite')}</h1>
                    </button>
                  </div>
                </motion.div>
              </div>
            </Typography>
          </Box>
        </Modal>

        {/* Modal to display user details-eye */}
        <Modal
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <div className="fixed inset-0 flex items-center justify-center ">
                <motion.div
                  className="absolute flex flex-col bg-container w-3/4 h-auto rounded-lg p-5"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-row justify-end items-center gap-2 text-white">
                    <IoCloseOutline
                      className="hover:text-buttonViolet  cursor-pointer"
                      onClick={() => setSelectedUser(null)}
                    />
                  </div>

                  {/* <div>
                    <hr className="h-0.5 w-[610px] border-t-0 bg-neutral-100 dark:bg-white/10" />
                  </div> */}
                  {selectedUser && (
                    <div>
                      <h1 className="text-lineGrey md:pb-2">
                        {t('tenant_name')}
                      </h1>
                      <input
                        type="text"
                        className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                        placeholder=""
                        name="tenantName"
                        value={selectedUser.userName}
                        disabled
                      ></input>
                      <h1 className="text-lineGrey md:py-2">{t('email')}</h1>
                      <input
                        type="email"
                        name="email"
                        value={selectedUser.email}
                        className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                        disabled
                      ></input>
                      <h1 className="text-lineGrey md:py-2">
                        {t('tenant_role')}
                      </h1>
                      <input
                        type="text"
                        name="description"
                        value={selectedUser.role}
                        className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                        disabled
                      ></input>
                    </div>
                  )}
                </motion.div>
              </div>
            </Typography>
          </Box>
        </Modal>
      </div>
    </>
  );
}

export default Users;
