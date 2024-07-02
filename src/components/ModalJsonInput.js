import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import JsonInput from './JsonInput';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

const ModalJsonInput = ({
  modalIsOpen,
  closeModal,
  configId,
  tenantId,
  API_URL,
  isCreate,
  fetchConfigs,
}) => {
  const [configKey, setConfigKey] = useState('');
  const [currentTenantId, setCurrentTenantId] = useState('');
  const [configValue, setConfigValue] = useState({});

  useEffect(() => {
    if (!isCreate && configId && tenantId) {
      const fetchConfigData = async () => {
        try {
          const token = localStorage.getItem('jwt');
          const response = await axios.get(
            `${API_URL}/api/v1/tenants/${tenantId}/configs/${configId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data.status === 'success') {
            const config = response.data.data.config;
            setConfigKey(config.config_key);
            setCurrentTenantId(config.tenantId);
            setConfigValue(config.config_value || {});
          }
        } catch (error) {
          console.error('Error fetching config data:', error);
        }
      };

      fetchConfigData();
    } else {
      setConfigKey('');
      setCurrentTenantId('');
      setConfigValue({});
    }
  }, [configId, tenantId, API_URL, isCreate]);

  const handleSave = async () => {
    const token = localStorage.getItem('jwt');
    const url = isCreate
      ? `${API_URL}/api/v1/configs`
      : `${API_URL}/api/v1/tenants/${tenantId}/configs/${configId}`;
    const method = isCreate ? 'post' : 'patch';
    try {
      const response = await axios[method](
        url,
        {
          config_key: configKey,
          tenantId: currentTenantId,
          config_value: configValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `Konfigurace byla úspěšně ${isCreate ? 'vytvořena' : 'upravena'}`
        );
        closeModal();
        fetchConfigs();
      } else {
        toast.error(
          `Konfigurace se nepodařilo ${isCreate ? 'vytvořit' : 'upravit'}`
        );
      }
    } catch (error) {
      toast.error(
        `Chyba při ${isCreate ? 'vytváření' : 'upravení'} konfigurace.`
      );
      console.error(
        `Error ${isCreate ? 'creating' : 'updating'} config:`,
        error
      );
    }
  };

  const handleConfigChange = (
    updatedConfigKey,
    updatedTenantId,
    updatedConfigValue
  ) => {
    console.log(
      'Updated values:',
      updatedConfigKey,
      updatedTenantId,
      updatedConfigValue
    );

    setConfigKey(updatedConfigKey);
    setCurrentTenantId(updatedTenantId);
    setConfigValue(updatedConfigValue);
  };

  return (
    <>
      <ToastContainer
        theme="colored"
        position="top-right"
        autoClose={3000}
        hideProgressBar
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit JSON"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isCreate ? 'Create JSON' : 'Edit JSON'}
          </h2>
          <button onClick={closeModal} className="text-xl">
            &times;
          </button>
        </div>
        <JsonInput
          initialConfigKey={configKey}
          initialTenantId={currentTenantId}
          initialConfigValue={configValue}
          onConfigChange={handleConfigChange}
          isCreate={isCreate}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-buttonHover text-white rounded-md shadow"
          >
            Uložit
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ModalJsonInput;
