import React, { useState, useEffect } from 'react';
import { useTranslate } from '@tolgee/react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns'; // import parseISO a isValid pro ověření datumu
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { IoCloseOutline } from 'react-icons/io5';
import { IoMdEye } from 'react-icons/io';
import Cookies from 'js-cookie';
import axios from 'axios';
import { MdEdit } from 'react-icons/md';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

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

function Tenants({ post, onDeletePost, onEditPost }) {
  const API_URL = process.env.REACT_APP_API_URL;

  const jwt = localStorage.getItem('jwt');

  const { t } = useTranslate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [postToDelete, setPostToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('desc');
  const [isDescending, setIsDescending] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [postId, setPostId] = useState('');

  const [formData, setFormData] = useState({
    tenantName: '',
    domain: '',
    description: '',
    email: '',
    createdAt: '',
    updatedAt: '',
  });

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    setIsViewing(false);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(false);
    setIsViewing(false);
    setFormData({
      tenantName: '',
      domain: '',
      description: '',
      email: '',
      createdAt: '', // Přidání createdAt a updatedAt
      updatedAt: '',
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { tenantName, domain, description, email } = formData;

    // Check if all required fields are filled
    if (!tenantName || !domain || !description || !email) {
      toast.error('Please fill in all fields.');
      return;
    }

    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing
      ? `${API_URL}/api/v1/tenants/${postId}`
      : `${API_URL}/api/v1/tenants`;

    try {
      const response = await axios(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        withCredentials: true,

        data: formData,
      });

      console.log(
        isEditing
          ? 'Tenant updated successfully.'
          : 'Tenant created successfully.'
      );
      setFormData({
        tenantName: '',
        domain: '',
        description: '',
        email: '',
        createdAt: '',
        updatedAt: '',
      });
      setOpen(false);
      fetchPosts();
    } catch (error) {
      console.error(
        'Error creating/updating tenant:',
        error.response?.data?.message || error.message
      );
    }
  };

  const fetchTenantById = async (tenantId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/tenants/${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          withCredentials: true,
        }
      );

      console.log('Fetched tenant data:', response.data);
      setSelectedTenant(response.data.data.tenant);
    } catch (error) {
      console.error('Error fetching tenant:', error);
    }
  };

  const handleEditPost = async (postId) => {
    setIsEditing(true);
    setPostId(postId);
    try {
      const response = await axios.get(`${API_URL}/api/v1/tenants/${postId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const postData = response.data.data.tenant;

      setFormData({
        tenantName: postData.tenantName,
        domain: postData.domain,
        description: postData.description,
        email:
          postData.users && postData.users.length > 0
            ? postData.users[0].email
            : '',
        createdAt: postData.createdAt,
        updatedAt: postData.updatedAt,
      });

      setOpen(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewPost = async (postId) => {
    setIsViewing(true);
    setPostId(postId);

    try {
      const response = await axios.get(`${API_URL}/api/v1/tenants/${postId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        withCredentials: true,
      });

      const postData = response.data.data.tenant;

      setFormData({
        tenantName: postData.tenantName,
        domain: postData.domain,
        description: postData.description,
        email:
          postData.users && postData.users.length > 0
            ? postData.users[0].email
            : '',
        createdAt: postData.createdAt,
        updatedAt: postData.updatedAt,
        tenantId: postData.tenantId,
      });

      setOpen(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/tenants`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        withCredentials: true,
      });
      setPosts(response.data.data.tenants);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [jwt]);

  const sortByTitle = () => {
    let sortedPosts = [...posts];
    if (!isDescending) {
      sortedPosts.sort((a, b) => a.tenantName.localeCompare(b.tenantName));
    } else {
      sortedPosts.sort((a, b) => b.tenantName.localeCompare(a.tenantName));
    }
    setPosts(sortedPosts);
    setIsDescending(!isDescending);
  };

  const showDeleteConfirmationDialog = (postId) => {
    setPostToDelete(postId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      handleDeletePost(postToDelete);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/v1/tenants/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          withCredentials: true,
        }
      );

      toast.success('Tenant deleted successfully.');
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting tenant.');
    }
  };

  return (
    <div className="flex flex-col md:gap-6 md:items-center items-center relative bg-newBackground rounded-lg h-auto  mx-auto">
      <ToastContainer
        theme="colored"
        position="top-right"
        autoClose={3000}
        hideProgressBar
      />

      <div className="flex flex-col gap-6 md:items-start items-center relative bg-container rounded-lg w-full xl:w-3/4 h-auto p-5 xl:p-10">
        <button
          onClick={handleOpen}
          className=" inline-block font-semibold leading-6 px-3 py-2 bg-buttonBlue text-sm z-10 text-white no-underline  cursor-pointer rounded-xl  mb-5 md:mb-0"
        >
          <p>{t('create_tenant')}</p>
        </button>
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
                <h1 className="text-white font-bold text-lg mb-3">
                  {' '}
                  {t('delete_post')}
                </h1>
                <p className="text-white text-sm">{t('delete_post_prompt')}</p>
                <div className="flex justify-center mt-8">
                  <button
                    onClick={confirmDeletePost}
                    className="relative mr-4 inline-block p-px font-semibold leading-6 text-white no-underline shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900"
                  >
                    <span className="absolute inset-0 overflow-hidden rounded-xl">
                      <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                    </span>
                    <div className="relative z-10 text-sm flex items-center px-3 py-2 space-x-2 rounded-lg bg-buttonBlue">
                      <p>{t('yes')}</p>
                    </div>
                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] transition-opacity duration-500 group-hover:opacity-40"></span>
                  </button>
                  <button className="text-white" onClick={cancelDeletePost}>
                    {t('no')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* modal create tenant */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <motion.div
                className="flex flex-col w-3/4 bg-container mx-auto rounded-lg p-5"
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
                  <h1 className="text-lineGrey md:pb-2">
                    {t('tenant_name')}
                    <span className="text-red-500 ml-1">*</span>
                  </h1>{' '}
                  <input
                    type="text"
                    className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                    placeholder=""
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleInputChange}
                    disabled={isViewing}
                  ></input>
                  <h1 className="text-lineGrey md:py-2">
                    {t('tenant_domain')}
                    <span className="text-red-500 ml-1">*</span>
                  </h1>
                  <input
                    type="text"
                    name="domain"
                    className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                    value={formData.domain}
                    onChange={handleInputChange}
                    disabled={isViewing}
                  ></input>
                  <h1 className="text-lineGrey md:py-2">
                    {t('email')} <span className="text-red-500 ml-1">*</span>
                  </h1>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                    disabled={isViewing}
                  ></input>
                  <h1 className="text-lineGrey md:py-2">
                    {t('tenant_description')}
                    <span className="text-red-500 ml-1">*</span>
                  </h1>
                  <textarea
                    type="text"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                    disabled={isViewing}
                  ></textarea>
                  {isViewing && (
                    <>
                      {' '}
                      <h1 className="text-lineGrey md:py-2">
                        {t('tenant_created_at')}
                      </h1>
                      <input
                        type="text"
                        name="createdAt"
                        value={
                          isValid(new Date(formData.createdAt))
                            ? format(
                                new Date(formData.createdAt),
                                'd MMMM yyyy'
                              )
                            : ''
                        }
                        onChange={handleInputChange}
                        className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                        disabled={isViewing}
                      ></input>
                      <h1 className="text-lineGrey md:py-2">
                        {t('tenant_updated_at')}
                      </h1>
                      <input
                        type="text"
                        name="updatedAt"
                        value={
                          isValid(new Date(formData.updatedAt))
                            ? format(
                                new Date(formData.updatedAt),
                                'd MMMM yyyy'
                              )
                            : ''
                        }
                        onChange={handleInputChange}
                        className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                        disabled={isViewing}
                      ></input>
                      <h1 className="text-lineGrey md:py-2">
                        {t('tenant_tenantId')}
                      </h1>
                      <input
                        type="text"
                        name="tenantId"
                        value={formData.tenantId}
                        onChange={handleInputChange}
                        className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                        disabled={isViewing}
                      ></input>
                    </>
                  )}
                  <div className="flex justify-end pt-5">
                    {!isViewing && (
                      <button
                        onClick={handleSubmit}
                        type="button"
                        className="font-semibold text-white no-underline bg-buttonGreen cursor-pointer px-3 py-2 rounded-lg "
                      >
                        {isEditing ? t('update') : t('save')}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Typography>
          </Box>
        </Modal>
        {/* fetch tenants */}
        {isLoading ? (
          <div className="flex justify-center items-center bg-container rounded-lg p-10 w-full xl:w-3/4 mx-auto">
            <ClipLoader color={'#123abc'} loading={isLoading} size={50} />
          </div>
        ) : (
          <div className="">
            <div className="flex flex-row justify-between items-center gap-6 text-white">
              <div className="flex flex-row ">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center justify-between w-full pb-5">
                    <div
                      onClick={sortByTitle}
                      className="flex flex-row gap-2 justify-center items-center w-20 md:w-24 xl:w-32 text-center cursor-pointer"
                    >
                      <h1 className="font-bold text-white text-sm">
                        {t('tenant_name')}
                      </h1>
                      {isDescending ? <IoIosArrowUp /> : <IoIosArrowDown />}
                    </div>
                    <div>
                      <h1 className="flex flex-row font-bold text-white text-sm w-20 md:w-24 xl:w-32 items-center justify-center text-center">
                        {t('tenant_domain')}
                      </h1>
                    </div>

                    <div className="flex flex-row gap-2 justify-center items-center w-20 md:w-24 xl:w-32 text-center">
                      <h1 className="font-bold text-white text-sm cursor-pointer">
                        {t('tenant_id')}
                      </h1>
                      <IoIosArrowDown
                        className={` ${
                          sortBy === 'asc' ? 'hidden' : ''
                        } cursor-pointer`}
                      />
                      <IoIosArrowUp
                        className={`${
                          sortBy === 'desc' ? 'hidden' : ''
                        } cursor-pointer`}
                      />
                    </div>
                    <div className="flex flex-row justify-center items-center w-20 md:w-24 xl:w-32 text-center">
                      <h1 className="font-bold text-white text-sm">
                        {t('tenant_created')}
                      </h1>
                    </div>
                    <div className="flex flex-row w-20 md:w-24 xl:w-32 gap-4">
                      <div className="w-7 h-7"></div>
                      <div className="w-7 h-7"></div>
                    </div>
                  </div>
                  <div>
                    <hr className="h-0.5 w-full border-t-0 bg-neutral-100 dark:bg-white/10" />
                  </div>
                  <div className="flex flex-col md:gap-4 gap-5 items-start my-5">
                    {posts.map((post) => (
                      <React.Fragment key={post._id}>
                        <div className="flex flex-row items-center justify-between w-full text-center">
                          <p className="font-bold text-sm text-white w-20 md:w-24 xl:w-32">
                            {post.tenantName}
                          </p>
                          <p className="text-white text-sm py-2 w-20 md:w-24 xl:w-32">
                            {post.domain}
                          </p>
                          <p className="text-white text-sm py-2 w-20 md:w-24 xl:w-32">
                            {post.tenantId}
                          </p>
                          <p className="text-white text-sm py-2 w-20 md:w-24 xl:w-32">
                            {format(new Date(post.createdAt), 'd MMMM yyyy')}
                          </p>
                          <div className="flex flex-row gap-2 md:gap-4 md:w-24 xl:w-32">
                            <div className="bg-container w-7 h-7 border border-[#414144] rounded-md flex justify-center items-center">
                              <IoMdEye
                                className="text-white cursor-pointer"
                                onClick={() => handleViewPost(post._id)}
                              />
                            </div>
                            <div className="bg-container w-7 h-7 border border-[#414144] rounded-md flex justify-center items-center">
                              <MdEdit
                                className="cursor-pointer text-buttonBlue"
                                onClick={() => handleEditPost(post._id)}
                              />
                            </div>
                            <div className="bg-container w-7 h-7 border border-[#414144] rounded-md flex justify-center items-center">
                              <RiDeleteBin6Line
                                onClick={() =>
                                  showDeleteConfirmationDialog(post._id)
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
    </div>
  );
}

export default Tenants;
