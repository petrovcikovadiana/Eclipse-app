import React, { useState, useEffect, Fragment } from 'react';
import { useTranslate } from '@tolgee/react';
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalJsonInput from '../../components/ModalJsonInput';
import { motion, AnimatePresence } from 'framer-motion';

function Configs() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { t } = useTranslate();
  const [configs, setConfigs] = useState([]);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('No token found, please log in first.');
        return;
      }
      const response = await axios.get(`${API_URL}/api/v1/configs/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setConfigs(response.data.data.configs);
      }
    } catch (error) {
      setError('Error fetching configs');
      console.error('Error fetching configs:', error);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, [API_URL]);

  const openModal = (configId = null, tenantId = null) => {
    setSelectedConfigId(configId);
    setSelectedTenantId(tenantId);
    setIsCreate(configId === null);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedConfigId(null);
    setSelectedTenantId(null);
  };

  const handleDeleteConfig = async (configId) => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await axios.delete(
        `${API_URL}/api/v1/configs/${configId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200 || response.status === 204) {
        toast.success('Config deleted successfully.');
        setConfigs((prevConfigs) =>
          prevConfigs.filter((config) => config._id !== configId)
        );
      } else {
        toast.error('Failed to delete config.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error deleting config.');
    }
  };

  const showDeleteConfirmationDialog = (configId) => {
    setConfigToDelete(configId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteConfig = () => {
    if (configToDelete) {
      handleDeleteConfig(configToDelete);
      setShowDeleteConfirmation(false);
    }
  };

  const cancelDeleteConfig = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <div className=" mx-auto bg-container rounded-lg mt-6 w-full xl:w-3/4 h-auto md:p-12">
      <div>
        <ToastContainer
          theme="colored"
          position="top-right"
          autoClose={3000}
          hideProgressBar
        />
        <div className="flex flex-col md:items-start items-center">
          <button
            className="font-semibold leading-6 px-3 py-2 bg-buttonBlue rounded-xl text-white"
            onClick={() => openModal()}
          >
            Create
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
                    {t('delete_post')}
                  </h1>
                  <p className="text-white text-sm">
                    {t('delete_post_prompt')}
                  </p>
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={confirmDeleteConfig}
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
                    <button className="text-white" onClick={cancelDeleteConfig}>
                      {t('no')}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <div className="flex flex-row justify-between items-center mt-5 text-white">
            <div className="flex flex-col">
              <div className="flex flex-row items-center justify-between pb-5">
                <div className="flex flex-row gap-2 items-center justify-center cursor-pointer w-32 xl:w-56 text-center ">
                  <h1 className="font-bold text-white text-sm ">
                    {t('config_key')}
                  </h1>
                </div>
                <div className="flex flex-row font-bold text-white text-sm w-32 xl:w-56 items-center justify-center text-center">
                  <h1>{t('tenant_id')}</h1>
                </div>
                <div className="flex flex-row w-32 xl:w-56 gap-4">
                  <div className="w-7 h-7"></div>
                  <div className="w-7 h-7"></div>
                </div>
              </div>
              <div>
                <hr className="h-0.5 w-full border-t-0 bg-neutral-100 dark:bg-white/10" />
              </div>
              <div className="flex flex-col gap-2 items-center my-2">
                {configs.length === 0 ? (
                  <p className="text-white text-sm">No posts available</p>
                ) : (
                  configs.map((config) => (
                    <Fragment key={config._id}>
                      <div className="flex flex-row items-center justify-between text-center w-full">
                        <p className="text-sm text-white w-32 xl:w-56">
                          {config.config_key}
                        </p>
                        <p className="text-white text-sm py-2 w-32 xl:w-56">
                          {config.tenantId}
                        </p>
                        <div className="flex flex-row gap-4 w-32 xl:w-56 items-center justify-center">
                          <div className="bg-container w-7 h-7 border border-[#414144] rounded-md flex justify-center items-center">
                            <MdEdit
                              className="cursor-pointer text-buttonBlue"
                              onClick={() =>
                                openModal(config._id, config.tenantId)
                              }
                            />
                          </div>
                          <div className="bg-container w-7 h-7 border border-[#414144] rounded-md flex justify-center items-center">
                            <RiDeleteBin6Line
                              onClick={() =>
                                showDeleteConfirmationDialog(config._id)
                              }
                              className="cursor-pointer text-logoRed"
                            />
                          </div>
                        </div>
                      </div>
                      <hr className="h-0.5 w-full border-t-0 bg-neutral-100 dark:bg-white/10" />
                    </Fragment>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalJsonInput
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        configId={selectedConfigId}
        tenantId={selectedTenantId}
        API_URL={API_URL}
        isCreate={isCreate}
        fetchConfigs={fetchConfigs}
      />
      <ToastContainer />
    </div>
  );
}

export default Configs;
