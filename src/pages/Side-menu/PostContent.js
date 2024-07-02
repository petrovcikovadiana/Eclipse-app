import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useTranslate } from '@tolgee/react';
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns'; // import format function
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode
import axios from 'axios'; // Import Axios
import { ClipLoader } from 'react-spinners'; // Import ClipLoader from react-spinners
import { IoCloseOutline } from 'react-icons/io5';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { IoCloudUploadOutline } from 'react-icons/io5';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const initialFormData = {
  title: '',
  slug: '',
  description: '',
  imageName: null,
};

function PostContent() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [posts, setPosts] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [showRightDiv, setShowRightDiv] = useState(false);
  const rightDivRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageChange, setImageChange] = useState(false);
  const [imageName, setImageName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState(['']);
  const [showImageInput, setShowImageInput] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [sortBy, setSortBy] = useState('desc');
  const [isDescending, setIsDescending] = useState(false);
  const { t } = useTranslate();

  // Fetch posts when the component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true); // Set loading to true when starting the request

    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('No JWT token found');
      setIsLoading(false);
      return;
    }

    const decodedToken = jwtDecode(token);
    const tenantId = decodedToken.tenantId;
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/tenants/${tenantId}/posts?sort=date&order=desc`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // Zahrnout cookies do požadavku
        }
      );
      if (response.data && response.data.data && response.data.data.posts) {
        setPosts(response.data.data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setIsLoading(false); // Set loading to false when request is complete
  };

  const handleRightDivOpen = () => {
    setShowRightDiv(true);
  };

  const handleRightDivClose = () => {
    setShowRightDiv(false);
    resetForm(); // Reset the form data when closing the panel
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (rightDivRef.current && !rightDivRef.current.contains(event.target)) {
        setShowRightDiv(false);
        handleRightDivClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeImage = () => {
    setImageUrl('');
    setImageChange(true);
    setShowImageInput(true);
    setFormData({ ...formData, imageName: '' }); // Set imageName to an empty string when the image is removed
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
      setImageName(file.name);
      setFormData({ ...formData, imageName: file }); // Store the file object
      setShowImageInput(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'title') {
      // Automatické generování slugu při změně titulu
      const slugValue = e.target.value
        .toLowerCase()
        .normalize('NFD') // Normalize string to NFD form
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
      setFormData((prevData) => ({
        ...prevData,
        slug: slugValue,
      }));
    }
  };

  const handleSortPosts = async (order) => {
    setIsLoading(true); // Set loading to true when starting the request

    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('No JWT token found');
      setIsLoading(false);
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const tenantId = decodedToken.tenantId;
      const response = await axios.get(
        `https://eclipse.cloudylake.io/api/v1/tenants/${tenantId}/posts?sort=date&order=desc`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setPosts(response.data.data.posts);
      setSortBy(order);
    } catch (error) {
      console.error('Error sorting posts:', error);
    }
    setIsLoading(false);
  };

  const sortByTitle = () => {
    let sortedPosts = [...posts];
    if (!isDescending) {
      sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sortedPosts.sort((a, b) => b.title.localeCompare(a.title));
    }
    setPosts(sortedPosts);
    setIsDescending(!isDescending);
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    return format(currentDate, 'd MMMM yyyy');
  };

  const handleEditPost = async (postId) => {
    console.log('postid', postId);
    // Otevřete pravý panel
    handleRightDivOpen();
    setIsEditing(true);

    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('No JWT token found');
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const tenantId = decodedToken.tenantId;
      const response = await axios.get(
        `${API_URL}/api/v1/tenants/${tenantId}/posts/${postId}`,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log(response.data);

      const formData = await response.data;

      // Získat URL obrázku z formData
      const imageUrl = `${API_URL}/img/posts/${formData.data.post.imageName}`;

      // Nastavte stav imageUrl
      setImageUrl(imageUrl);

      // Nastavte stav formData s načtenými daty
      setFormData({
        title: formData.data.post.title,
        slug: formData.data.post.slug,
        description: formData.data.post.description,
        imageName: formData.data.post.imageName,
      });

      // Set isEditing to true and postId to the ID of the post being edited
      setPostId(formData.data.post._id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, slug, description, imageName } = formData;

    if (!title || !slug || !description || !imageName) {
      toast.error('Please fill in all fields.');
      return;
    }

    // Additional check for image during edit
    if (isEditing && !imageName) {
      toast.error('Please upload an image.');
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('No JWT token found');
      return;
    }
    const decodedToken = jwtDecode(token);
    const tenantId = decodedToken.tenantId;
    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing
      ? `${API_URL}/api/v1/tenants/${tenantId}/posts/${postId}`
      : `${API_URL}/api/v1/tenants/${tenantId}/posts`;

    try {
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('slug', formData.slug);
      postData.append('description', formData.description);
      if (formData.imageName) {
        postData.append('image', formData.imageName);
      }

      const response = await axios(url, {
        method,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,

        data: postData,
      });

      setFormData({
        title: '',
        slug: '',
        description: '',
        imageName: null,
      });
      handleRightDivClose();
      fetchPosts();
      toast.success('Post created/edited successfully.');
    } catch (error) {
      console.error(
        'Error creating/updating post:',
        error.response?.data?.message || error.message
      );
      toast.error('Error creating/updating post.');
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setImageUrl('');
    setImageChange(false);
    setShowImageInput(false);
    setImageName(false);
  };

  // const handleAction = async () => {
  //   try {
  //     if (isEditing) {
  //       await handleSubmit(postId);
  //     } else {
  //       await handleSubmit();
  //       reset();
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem('jwt');
    const decodedToken = jwtDecode(token);
    const tenantId = decodedToken.tenantId;
    if (!token) {
      console.error('No JWT token found');
      return;
    }
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/tenants/${tenantId}/posts/${postId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // Include credentials (cookies) in the request
        }
      );

      const newId = response.data;
      if (newId) {
        const post = newId.data.post;
        const imageName = post.imageName;

        await axios.delete(`${API_URL}/api/v1/posts/deleteImg/${imageName}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        await axios.delete(
          `${API_URL}/api/v1/tenants/${tenantId}/posts/${postId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true, // Include credentials (cookies) in the request
          }
        );

        reset();
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        toast.success('Post deleted successfully.');
      }
    } catch (error) {
      console.error('Chyba:', error);
    }
  };

  const [seed, setSeed] = useState(1);
  const reset = () => {
    setSeed(Math.random());
  };

  const showDeleteConfirmationDialog = (postId) => {
    setPostToDelete(postId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeletePost = async () => {
    setIsLoading(true); // Set loading to true when starting the request
    await handleDeletePost(postToDelete);
    setIsLoading(false); // Set loading to false when request is complete
    setShowDeleteConfirmation(false);
  };

  const cancelDeletePost = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="flex flex-col md:gap-6 md:items-center relative items-center bg-newBackground rounded-lg mx-auto h-auto">
      <ToastContainer
        theme="colored"
        position="top-right"
        autoClose={3000}
        hideProgressBar
      />
      <div className="flex flex-col gap-6 md:items-start items-center relative bg-container xl:w-3/4 w-full  rounded-lg p-5 h-auto xl:p-10">
        <button
          onClick={handleRightDivOpen}
          className=" inline-block font-semibold leading-6 px-3 py-2 bg-buttonBlue text-sm z-10 text-white no-underline  cursor-pointer rounded-xl  mb-5 md:mb-0"
        >
          + {t('new_item')}
        </button>
        <AnimatePresence>
          {showDeleteConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center ring-1 ring-buttonBlue/30 p-10 rounded-lg bg-zinc-100 backdrop-filter backdrop-blur-md bg-opacity-10"
              >
                <h1 className="text-white font-bold text-xl mb-3">
                  {t('delete_post')}
                </h1>
                <p className="text-white text-lg"> {t('delete_post_prompt')}</p>
                <div className="flex justify-center mt-8">
                  <button
                    onClick={confirmDeletePost}
                    className="relative mr-4 inline-block p-px font-semibold leading-6 text-white no-underline shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900"
                  >
                    <span className="absolute inset-0 overflow-hidden rounded-xl">
                      <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                    </span>
                    <div className="relative z-10 text-md flex items-center px-3 py-2 space-x-2 rounded-lg bg-buttonBlue">
                      <p> {t('yes')}</p>
                    </div>
                    <span className="absolute -bottom-0 left-[1.125rem)] transition-opacity duration-500 group-hover:opacity-40"></span>
                  </button>
                  <button className="text-white" onClick={cancelDeletePost}>
                    {t('no')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {isLoading ? (
          <div className="flex justify-center items-center bg-container rounded-lg p-10 mx-auto xl:w-3/4 w-full">
            <ClipLoader color={'#123abc'} loading={isLoading} size={50} />
          </div>
        ) : (
          <Fragment>
            <div className="">
              <div className="flex flex-row justify-between items-center gap-6 text-white">
                <div className="flex flex-row">
                  <div className="flex flex-col ">
                    <div className="flex flex-row items-center justify-between w-full pb-5">
                      <div
                        onClick={sortByTitle}
                        className="flex flex-row gap-2 items-center justify-center cursor-pointer w-24 xl:w-44 text-center "
                      >
                        <h1 className="font-bold text-white text-sm ">
                          {t('title')}
                        </h1>
                        {isDescending ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </div>
                      <div className="flex flex-row font-bold text-white text-sm w-24 xl:w-44 items-center justify-center text-center">
                        <h1>{t('description')}</h1>
                      </div>
                      <div className="flex flex-row gap-2 w-24 xl:w-44 items-center justify-center text-center">
                        <h1
                          onClick={() => handleSortPosts('desc')}
                          className="font-bold text-white text-sm cursor-pointer"
                        >
                          {t('date')}
                        </h1>
                        <IoIosArrowDown
                          onClick={() => handleSortPosts('asc')}
                          className={` ${
                            sortBy === 'asc' ? 'hidden' : ''
                          } cursor-pointer`}
                        />
                        <IoIosArrowUp
                          onClick={() => handleSortPosts('desc')}
                          className={`${
                            sortBy === 'desc' ? 'hidden' : ''
                          } cursor-pointer`}
                        />
                      </div>
                      <div className="flex flex-row w-24 xl:w-44 gap-4 items-center justify-center text-center">
                        <div className="w-7 h-7"></div>
                        <div className="w-7 h-7"></div>
                      </div>
                    </div>
                    <div>
                      <hr className="h-0.5  w-full  border-t-0 bg-neutral-100 dark:bg-white/10" />
                    </div>
                    <div className="flex flex-col gap-2 items-start my-2">
                      {posts.length === 0 ? (
                        <p className="text-white text-sm">No posts available</p>
                      ) : (
                        posts.map((post) => (
                          <Fragment key={post._id}>
                            <div className="flex flex-row items-center justify-between text-center w-full">
                              <p className=" text-sm text-white w-24 xl:w-44">
                                {post.title}
                              </p>
                              <p className="text-white text-sm py-2 w-24 xl:w-44">
                                {post.description.length > 20
                                  ? `${post.description.slice(0, 20)}...`
                                  : post.description}
                              </p>
                              <p className="text-white text-sm py-2 w-24 xl:w-44">
                                {format(new Date(post.date), 'd MMMM yyyy')}
                              </p>
                              <div className="flex flex-row gap-4 w-24 xl:w-44 items-center justify-center">
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
                            <hr className="h-0.5  w-full border-t-0 bg-neutral-100 dark:bg-white/10" />
                          </Fragment>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        )}
        {/* right side */}
        <AnimatePresence>
          {showRightDiv && (
            <div className="fixed inset-0 flex items-center h-auto justify-center bg-black bg-opacity-50 z-50">
              <motion.div
                ref={rightDivRef}
                className="absolute sm:right-3 sm:top-10 flex flex-col gap-6 bg-container h-auto rounded-lg p-5 w-full sm:w-[600px] md:w-[700px] max-w-[90%] sm:max-w-none"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between">
                  <div className="flex flex-row justify-start items-center gap-2 text-white">
                    <IoCloseOutline
                      className="hover:text-buttonViolet cursor-pointer"
                      onClick={() => {
                        handleRightDivClose();
                      }}
                    />
                    <h1>{t('new_item')}</h1>
                  </div>
                  <button
                    onClick={handleSubmit}
                    type="button"
                    className="relative inline-block p-px font-semibold text-white no-underline bg-buttonGreen shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900"
                  >
                    <span className="absolute inset-0 overflow-hidden rounded-xl">
                      <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                    </span>
                    <div className="relative z-10 text-sm flex items-center px-3 py-2 space-x-2 rounded-xl">
                      {isEditing ? t('update') : t('save')}
                    </div>
                    <span className="absolute -bottom-0 left-[1.125rem)] transition-opacity duration-500 group-hover:opacity-40"></span>
                  </button>
                </div>
                <div>
                  <hr className="h-0.5  w-full border-t-0 bg-neutral-100 dark:bg-white/10" />
                </div>
                <div>
                  {/* title */}
                  <h1 className="text-lineGrey pb-2">
                    {t('title')} <span className="text-red-500 ml-1">*</span>
                  </h1>
                  <input
                    type="text"
                    className="rounded-lg bg-newBackground text-white py-2 w-full px-4"
                    placeholder=""
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  ></input>
                  {/* slug */}
                  <h1 className="text-lineGrey py-2">
                    {t('slug')} <span className="text-red-500 ml-1">*</span>
                  </h1>
                  <input
                    type="text"
                    name="slug"
                    className="rounded-lg bg-backgroundBlack text-lineGrey py-2 w-full px-4"
                    value={formData.slug}
                    onChange={handleInputChange}
                    disabled
                  ></input>
                  {/* date */}
                  <h1 className="text-lineGrey py-2">
                    {t('date')} <span className="text-red-500 ml-1">*</span>
                  </h1>
                  <input
                    className="rounded-lg bg-backgroundBlack text-white py-2 w-full px-4"
                    placeholder={getCurrentDate()}
                    disabled
                  ></input>
                  {/* image */}
                  <div className="form-group pt-2">
                    <label htmlFor="image" className="text-lineGrey ">
                      {t('image')} <span className="text-red-500 ml-1">*</span>
                    </label>
                    {imageUrl && !showImageInput ? (
                      <div className="flex items-center justify-start py-2 bg-newBackground">
                        <img
                          src={imageUrl}
                          alt="Post"
                          className="w-28 h-28 p-3 object-cover"
                        />
                        <button
                          type="button"
                          className="text-black absolute top-[370px] left-[95px] m-2 cursor-pointer"
                          onClick={closeImage}
                        >
                          <div>
                            <IoMdCloseCircleOutline
                              style={{
                                color: 'red',
                                fontSize: '30px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                              }}
                            />
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-start bg-newBackground rounded-lg mt-2">
                        {!imageName && (
                          <label
                            htmlFor="image"
                            className="text-white p-3 flex flex-col items-center justify-center"
                          >
                            <IoCloudUploadOutline
                              style={{
                                color: '#B7B7B7',
                                fontSize: '60px',
                              }}
                            />
                            <p className="flex items-center text-md text-lineGrey justify-center">
                              {t('select_image')}
                            </p>
                          </label>
                        )}
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          required
                        />
                        {imageName && (
                          <p className="text-white mt-2">{imageName}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* description */}
                  <h1 className="text-lineGrey py-2">
                    {t('description')}{' '}
                    <span className="text-red-500 ml-1">*</span>
                  </h1>
                  <textarea
                    type="text"
                    name="description"
                    rows="4" // Zvýší počet řádků na 10
                    value={formData.description}
                    onChange={handleInputChange}
                    className="rounded-lg bg-newBackground text-white py-2 w-full px-4 mb-2"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PostContent;
