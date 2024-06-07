import React, { useState, useEffect } from 'react';
import { useTranslate } from '@tolgee/react';
import { RiEdit2Line } from 'react-icons/ri';
import { RiDeleteBin6Line } from 'react-icons/ri';

import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns'; // import format function

function PostContent({ post, onDeletePost, onEditPost }) {
  const { t } = useTranslate();
  //post
  const [posts, setPosts] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          'https://eclipse.cloudylake.io/api/v1/posts?sort=date&order=desc'
        );
        const data = await response.json();
        setPosts(data.data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  //sort by date
  const [sortBy, setSortBy] = useState('desc');

  const handleSortPosts = async (order) => {
    try {
      const response = await fetch(
        `https://eclipse.cloudylake.io/api/v1/posts?sort=date&order=${order}`
      );
      const data = await response.json();
      setPosts(data.data.posts);
      setSortBy(order);
    } catch (error) {
      console.error('Error sorting posts:', error);
    }
  };

  const [isDescending, setIsDescending] = useState(false);

  const sortByTitle = () => {
    let sortedPosts = [...posts];
    if (!isDescending) {
      sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sortedPosts.sort((a, b) => b.title.localeCompare(a.title));
    }
    setPosts(sortedPosts);
    setIsDescending(!isDescending); // Inverze hodnoty isDescending
  };

  // Funkce pro zobrazení potvrzovacího okna
  const showDeleteConfirmationDialog = (postId) => {
    setPostToDelete(postId);
    setShowDeleteConfirmation(true);
  };

  // Funkce pro potvrzení smazání příspěvku
  const confirmDeletePost = () => {
    onDeletePost(postToDelete);
    setShowDeleteConfirmation(false);
  };

  // Funkce pro zrušení smazání příspěvku
  const cancelDeletePost = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="flex flex-col gap-6 items-start relative  bg-[#12122b]  rounded-lg h-auto p-10">
      {/* Potvrzovací dialog */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center ring-1 ring-buttonViolet/30 p-10 rounded-lg bg-zinc-100 backdrop-filter backdrop-blur-md bg-opacity-10"
            >
              <h1 className="text-white font-bold text-xl mb-3">Delete post</h1>
              <p className="text-white text-lg"> {t('delete_post_prompt')}</p>
              <div className="flex justify-center mt-8">
                <button
                  onClick={confirmDeletePost}
                  class="relative mr-4 inline-block p-px font-semibold leading-6 text-white no-underline  shadow-2xl cursor-pointer group rounded-lg shadow-zinc-900"
                >
                  <span class="absolute inset-0 overflow-hidden rounded-xl">
                    <span class="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                  </span>

                  <div class="relative z-10 text-md flex items-center px-3 py-2 space-x-2 rounded-lg  bg-gradient-to-r from-[#7c2889] via-[#59277c]">
                    <p> {t('yes')}</p>
                  </div>

                  <span class="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] transition-opacity duration-500 group-hover:opacity-40"></span>
                </button>
                <button className="text-white" onClick={cancelDeletePost}>
                  {t('no')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Konec potvrzovacího dialogu */}

      <div className="flex md:justify-between">
        <div className="flex flex-row justify-start items-center gap-6 text-white">
          <div className="flex flex-row md:gap-44">
            <div className="flex flex-col">
              <div className="flex flex-row md:gap-64 gap-20 items-center justify-center mx-auto pb-5">
                <div
                  onClick={sortByTitle}
                  className="flex flex-row gap-2 justify-center items-center cursor-pointer"
                >
                  <h1 className="font-bold text-lineGrey text-sm">
                    {t('title')}
                  </h1>
                  {isDescending ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div>
                <h1 className="font-bold text-lineGrey text-sm">
                  {t('description')}
                </h1>
                <div className="flex flex-row gap-2 justify-center items-center">
                  <h1
                    onClick={() => handleSortPosts('desc')}
                    className="font-bold text-lineGrey text-sm cursor-pointer"
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
              </div>

              <div>
                <hr className="h-0.5 md:w-[850px] w-[380px] absolute border-t-0 bg-neutral-100 dark:bg-white/10" />
              </div>
              <div className="flex flex-col md:gap-8 gap-5 items-start my-5">
                {posts.map((post) => (
                  <div
                    className="flex flex-row items-center justify-center gap-6 md:gap-5"
                    key={post._id}
                  >
                    <h1 className="font-bold text-white w-20  md:w-80">
                      {post.title}
                    </h1>
                    <p className="text-white text-sm py-2 w-20 md:w-80">
                      {post.description}
                    </p>
                    <p className="text-white">
                      {format(new Date(post.date), 'd MMMM yyyy')}
                    </p>
                    <RiEdit2Line
                      className="cursor-pointer text-buttonViolet"
                      onClick={() => onEditPost(post._id)}
                    />
                    <RiDeleteBin6Line
                      onClick={() => showDeleteConfirmationDialog(post._id)}
                      className="cursor-pointer text-logoRed"
                    />
                  </div>
                ))}
                <div>
                  <hr className="h-0.5 md:w-[850px] w-[380px] absolute border-t-0 bg-neutral-100 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostContent;
