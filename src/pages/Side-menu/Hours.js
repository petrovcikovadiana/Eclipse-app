import React, { useState, useEffect } from 'react';
import { useTranslate } from '@tolgee/react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie'; // Import Cookies library
import axios from 'axios'; // Import Axios
import { Outlet } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

function Hours() {
  const API_URL = process.env.REACT_APP_API_URL;

  const jwt = localStorage.getItem('jwt'); // Get the token from cookies

  const { t } = useTranslate();

  const [hours, setHours] = useState({});
  const [configId, setConfigId] = useState(null); // Store the config ID
  const [isLoading, setIsLoading] = useState(false);

  // Fetch hours
  useEffect(() => {
    setIsLoading(true);
    const fetchHours = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/v1/configs/key/openingHours`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwt}`,
            },
            withCredentials: true, // Zahrnout cookies do požadavku
          }
        );
        const openingHoursConfig = response.data.data.config;
        setHours(openingHoursConfig.config_value);
        setConfigId(openingHoursConfig._id); // Set the config ID
      } catch (error) {
        console.error('Error fetching hours:', error);
      }
      setIsLoading(false);
    };

    fetchHours();
  }, [jwt]);

  const handleTimeChange = (day, field, value) => {
    setHours((prevHours) => ({
      ...prevHours,
      [day]: {
        ...prevHours[day],
        [field]: value,
      },
    }));
  };

  const handleCheckboxChange = (day) => {
    setHours((prevHours) => ({
      ...prevHours,
      [day]: {
        ...prevHours[day],
        isOpen: !prevHours[day].isOpen,
      },
    }));
  };

  // Patch hours
  const handleSave = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/configs/${configId}`,
        { config_value: hours },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Hodiny byly úspěšně upraveny');
        console.log('Hours successfully updated.', hours);
      } else {
        console.error('Failed to update hours.');
        toast.error('Upravení hodin se nezdařilo.');
      }
    } catch (error) {
      console.error('Error updating hours:', error);
      toast.error('Chyba při upravování hodin.');
    }
  };

  return (
    <div className="flex flex-col md:gap-6 pt-6 items-center relative bg-newBackground h-auto ">
      <div className="flex flex-col gap-6 items-start relative bg-container rounded-lg xl:w-3/4 h-auto p-5 md:p-10">
        <ToastContainer
          theme="colored"
          position="top-right"
          autoClose={3000}
          hideProgressBar
        />
        <Outlet />
        {isLoading ? (
          <div className="flex justify-center items-center bg-container mx-auto rounded-lg p-10 xl:w-3/4">
            <ClipLoader color={'#123abc'} loading={isLoading} size={50} />
          </div>
        ) : (
          <ul className="w-full">
            {Object.entries(hours).map(([day, details]) => (
              <li key={day}>
                <div className="flex flex-row items-center mb-4 justify-center gap-2 md:gap-10">
                  <div className="flex items-center w-32 gap-5">
                    <input
                      id={`checkbox-${day}`}
                      type="checkbox"
                      checked={details.isOpen}
                      onChange={() => handleCheckboxChange(day)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor={`checkbox-${day}`}
                      className="text-sm font-medium text-gray-500"
                    >
                      <h2 className="text-white">{t(day)}</h2>
                    </label>
                  </div>
                  <input
                    type="time"
                    id={`start-time-${day}`}
                    className={`bg-gray-50 w-40 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                      !details.isOpen ? 'opacity-50' : ''
                    }`}
                    value={details.open}
                    onChange={(e) =>
                      handleTimeChange(day, 'open', e.target.value)
                    }
                    disabled={!details.isOpen}
                    required
                  />
                  <input
                    type="time"
                    id={`end-time-${day}`}
                    className={`bg-gray-50 w-40 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${
                      !details.isOpen ? 'opacity-50' : ''
                    }`}
                    value={details.close}
                    onChange={(e) =>
                      handleTimeChange(day, 'close', e.target.value)
                    }
                    disabled={!details.isOpen}
                    required
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-center mx-auto ">
          <button
            onClick={handleSave}
            className="bg-buttonGreen text-white px-3 py-2 rounded-lg text-sm"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hours;
