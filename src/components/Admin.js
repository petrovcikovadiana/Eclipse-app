import React, { useState, useRef, useEffect } from 'react';
import { GrStorage } from 'react-icons/gr';
import { IoCloseOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslate } from '@tolgee/react';
import { Link } from 'react-router-dom';
import PostContent from './PostContent';
import { IoMdCloseCircle } from 'react-icons/io';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { IoCloudUploadOutline } from 'react-icons/io5';

// Import komponent pro obsah jednotlivých položek menu
import Hours from './Hours';
import Users from './Users';
import { format } from 'date-fns';
import { LanguageSelect } from '../LanguageSelect';
import CreateTenant from './CreateTenant';

function Admin() {
  const [imageUrl, setImageUrl] = useState('');
  const [imageChange, setImageChange] = useState(false);
  const [imageName, setImageName] = useState('');

  const { t } = useTranslate();
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState(['']);

  const [showRightDiv, setShowRightDiv] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState('posts');
  const rightDivRef = useRef(null);
  const [showImageInput, setShowImageInput] = useState(false);

  const handleMenuItemClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
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

  const initialFormData = {
    title: '',
    slug: '',
    description: '',
    image: null,
  };

  const [formData, setFormData] = useState(initialFormData);

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

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImageName(file.name); // Nastavení názvu souboru
      setFormData((prevData) => ({
        ...prevData,
        image: file, // Nastavit vybraný obrázek vstupu
      }));
    }
  };

  const handleEditPost = async (postId) => {
    setIsEditing(true);
    try {
      const response = await fetch(
        `https://eclipse.cloudylake.io/api/v1/posts/${postId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch post data: ${response.statusText}`);
      }
      const formData = await response.json();

      // Otevřete pravý panel
      handleRightDivOpen();
      // Získat URL obrázku z formData
      const imageUrl = `https://eclipse.cloudylake.io/img/posts/${formData.data.post.imageName}`;

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
  const handleSubmit = async () => {
    try {
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('slug', formData.slug);
      postData.append('description', formData.description);
      postData.append('image', formData.image);

      const method = isEditing ? 'PATCH' : 'POST';

      if (imageChange) {
        const deleteImageResponse = await fetch(
          `https://eclipse.cloudylake.io/api/v1/posts/deleteImg/${formData.imageName}`,
          {
            method: 'DELETE',
          }
        );

        if (deleteImageResponse.ok) {
          console.log('Starý obrázek úspěšně odstraněn.');
        } else {
          console.error(
            'Chyba při odstraňování starého obrázku:',
            deleteImageResponse.statusText
          );
        }
      }

      let response = null;
      if (isEditing) {
        response = await fetch(
          `https://eclipse.cloudylake.io/api/v1/posts/${postId}`,
          {
            method,
            body: postData,
          }
        );
      } else {
        response = await fetch(`https://eclipse.cloudylake.io/api/v1/posts`, {
          method,
          body: postData,
        });
      }

      if (response.ok) {
        handleRightDivClose();
        setImageName('');

        console.log(
          isEditing
            ? 'Post updated successfully.'
            : 'Post created successfully.'
        );
        resetForm();

        // Reset form data after successful post
        setFormData((prevData) => ({
          ...prevData,
          title: '',
          slug: '',
          description: '',
          image: null,
        }));
      } else {
        console.error(
          'Chyba při vytváření/upravování příspěvku:',
          response.statusText
        );
      }
      handleRightDivClose();
    } catch (error) {
      console.error('Chyba:', error);
    }
  };

  //delete post
  const [posts, setPosts] = useState([]);

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(
        `https://eclipse.cloudylake.io/api/v1/posts/${postId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch post data: ${response.statusText}`);
      }
      const newId = await response.json();

      if (newId) {
        // Získání názvu souboru obrázku připojeného k příspěvku
        const post = newId.data.post;
        const imageName = post.imageName;
        // delete image
        const deleteImageResponse = await fetch(
          `https://eclipse.cloudylake.io/api/v1/posts/deleteImg/${imageName}`,
          {
            method: 'DELETE',
          }
        );

        if (deleteImageResponse.ok) {
          console.log('Obrázek byl úspěšně odstraněn.');
        } else {
          console.error(
            'Chyba při odstraňování obrázku:',
            deleteImageResponse.statusText
          );
        }

        //delete post
        const deletePostResponse = await fetch(
          `https://eclipse.cloudylake.io/api/v1/posts/${postId}`,
          {
            method: 'DELETE',
          }
        );
        if (!deletePostResponse.ok) {
          throw new Error(
            `Failed to delete post: ${deletePostResponse.statusText}`
          );
        }
        console.log('Příspěvek byl úspěšně odstraněn.');
        reset();
        //  Aktualizace seznamu příspěvků odebráním smazaného příspěvku
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
      } else {
        console.error('Chyba při mazání příspěvku:', response.statusText);
      }
    } catch (error) {
      console.error('Chyba:', error);
    }
  };
  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setImageUrl('');
    setImageChange(false);
    setShowImageInput(false);
  };
  const handleAction = async () => {
    try {
      if (isEditing) {
        await handleSubmit(postId);
      } else {
        await handleSubmit();
        reset();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  //reset komponenty
  const [seed, setSeed] = useState(1);
  const reset = () => {
    setSeed(Math.random());
  };

  //sidebar
  const menuItems = [
    {
      label: t('posts'),
      icon: <GrStorage />,
      value: 'posts',
      content: (
        <PostContent
          posts={posts}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
          key={seed}
        />
      ),
    },
    {
      label: t('opening_hours'),
      icon: <GrStorage />,
      value: 'hours',
      content: <Hours />,
    },
    {
      label: t('account'),
      icon: <GrStorage />,
      value: 'users',
      content: <Users />,
    },
    {
      label: t('collections_create_tenant'),
      icon: <GrStorage />,
      value: 'createtenants',
      content: <CreateTenant />,
    },
  ];

  //current date
  const getCurrentDate = () => {
    const currentDate = new Date();
    return format(currentDate, 'd MMMM yyyy');
  };

  // Funkce pro získání obsahu aktuálně vybrané položky menu
  const getCurrentContent = () => {
    const selectedItem = menuItems.find(
      (item) => item.value === selectedMenuItem
    );
    return selectedItem ? selectedItem.content : null;
  };
  const closeImage = () => {
    setImageUrl('');
    setImageChange(true);
    setShowImageInput(true);
  };
  return (
    <>
      <div className="bg-background">
        <div className="flex md:flex-row flex-col md:gap-24 items-center justify-center text-center md:text-start md:items-start md:justify-start max-w-[1440px]  mx-auto bg-background ">
          {/* left side */}
          <div className="flex flex-col text-white gap-6 md:pl-5 pt-5 ">
            <div className="flex flex-row items-center justify-start gap-3 ">
              <Link to="/">
                <img
                  src={process.env.PUBLIC_URL + '/assets/svg/eclipse.svg'}
                  alt="eclipse"
                />
              </Link>

              <button class="relative inline-block p-px font-semibold leading-6 text-white bg-gradient-to-r from-[#7c2889] via-[#59277c]  to-[#2a1d54] no-underline  shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900">
                <span class="absolute inset-0 overflow-hidden rounded-xl">
                  <span class="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                </span>
                <Link to="/">
                  <div class="relative z-10 text-sm flex items-center px-3 py-2 space-x-2 rounded-xl  ">
                    <p>ECLIPSE</p>
                  </div>
                </Link>
                <span class="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)]  transition-opacity duration-500 group-hover:opacity-40"></span>
              </button>
            </div>

            <div className="flex flex-col min-h-screen">
              <h1 className="font-bold pb-4">{t('collections')}</h1>
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-4 items-center cursor-pointer pb-2 hover:text-buttonViolet"
                  onClick={() => handleMenuItemClick(item.value)}
                >
                  <GrStorage />
                  <h1>{item.label}</h1>
                </div>
              ))}
              <div className="md:mt-auto flex flex-col items-center justify-center mx-auto p-5 pb-24">
                <LanguageSelect />
                <p className="text-textGrey pt-3 text-sm hover:text-white cursor-pointer">
                  {t('logout')}
                </p>
              </div>
            </div>
          </div>

          <div class="h-[500px] hidden md:block w-px bg-white/10 md:mt-5"></div>
          {/* middle side */}
          <div className="flex flex-col md:gap-6 md:items-start items-center relative bg-background h-screen pt-5 ">
            <button
              onClick={handleRightDivOpen}
              class="relative inline-block p-px font-semibold leading-6 bg-gradient-to-r from-[#7c2889] via-[#59277c]  to-[#2a1d54] text-white no-underline  shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900 mb-5 md:mb-0"
            >
              <span class="absolute inset-0 overflow-hidden rounded-xl">
                <span class="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
              </span>
              <div class="relative z-10 text-sm flex items-center px-3 py-2 space-x-2 rounded-xl  ">
                + {t('new_item')}
              </div>
              <span class="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] transition-opacity duration-500 group-hover:opacity-40"></span>
            </button>

            {getCurrentContent()}

            <div className="flex md:justify-between ">
              <div className="flex flex-row justify-start items-center md:gap-6 text-white">
                <div className="flex flex-row md:gap-44 ">
                  {selectedMenuItem && selectedMenuItem.content}
                </div>
              </div>
            </div>
          </div>

          {/* right side */}
          <AnimatePresence>
            {showRightDiv && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <motion.div
                  ref={rightDivRef}
                  className="absolute right-3 top-20 flex flex-col gap-6 bg-cards h-auto rounded-lg p-5 "
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between">
                    {' '}
                    <div className="flex flex-row justify-start items-center gap-2 text-white ">
                      {' '}
                      <IoCloseOutline
                        className="hover:text-buttonViolet cursor-pointer"
                        onClick={() => {
                          handleRightDivClose();
                        }}
                      />
                      <h1>{t('new_item')}</h1>
                    </div>
                    <button
                      onClick={handleAction}
                      type="button"
                      class="relative inline-block p-px font-semibold text-white no-underline bg-[#50aa44] shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900"
                    >
                      <span class="absolute inset-0 overflow-hidden rounded-xl">
                        <span class="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                      </span>
                      <div class="relative z-10 text-sm flex items-center px-3 py-2 space-x-2 rounded-xl   ">
                        {isEditing ? t('update') : t('save')}
                      </div>
                      <span class="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)]  transition-opacity duration-500 group-hover:opacity-40"></span>
                    </button>
                  </div>
                  <div>
                    {' '}
                    <hr class="h-0.5 w-[610px] border-t-0 bg-neutral-100 dark:bg-white/10" />
                  </div>
                  <div>
                    {' '}
                    {/* title */}
                    <h1 className="text-lineGrey md:pb-2">{t('title')}</h1>
                    <input
                      type="text"
                      className="rounded-lg bg-darkPink text-white py-2 w-full px-4"
                      placeholder=""
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    ></input>
                    {/* slug */}
                    <h1 className="text-lineGrey md:py-2">{t('slug')}</h1>
                    <input
                      type="text"
                      name="slug"
                      className="rounded-lg bg-background text-lineGrey py-2 w-full px-4"
                      value={formData.slug}
                      onChange={handleInputChange}
                      disabled
                      // onChange={(e) => setSlug(e.target.value)}
                    ></input>
                    {/* date */}
                    <h1 className="text-lineGrey md:py-2">{t('date')}</h1>
                    <input
                      className="rounded-lg bg-background text-white py-2 w-full px-4"
                      placeholder={getCurrentDate()}
                      disabled
                    ></input>{' '}
                    {/* description */}
                    <h1 className="text-lineGrey md:py-2">
                      {t('description')}
                    </h1>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="rounded-lg bg-darkPink text-white py-2 w-full px-4 mb-2"
                    />
                    {/* image */}
                    <div className="form-group">
                      <label htmlFor="image" className="text-lineGrey">
                        {t('image')}
                      </label>
                      {imageUrl && !showImageInput ? (
                        <div className="flex items-center justify-center">
                          <img src={imageUrl} alt="Post" />
                          <button
                            type="button"
                            className="text-black absolute top-[450px] right-[180px] m-2 cursor-pointer"
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
                        <div className="flex items-center justify-center">
                          {!imageName && (
                            <label
                              htmlFor="image"
                              className="text-white mb-2 flex flex-col items-center justify-center"
                            >
                              <IoCloudUploadOutline
                                style={{
                                  color: 'white',
                                  fontSize: '70px',
                                }}
                              />
                              <p className="flex items-center justify-center">
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
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default Admin;
