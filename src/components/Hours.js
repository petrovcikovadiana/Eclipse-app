import React, { useState, useEffect } from 'react';
import { useTranslate } from '@tolgee/react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

function Hours() {
  const { t } = useTranslate();

  const [hours, setHours] = useState({});

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await fetch(
          'https://eclipse.cloudylake.io/api/v1/configs'
        );
        const data = await response.json();
        const openingHoursConfig = data.data.configs.find(
          (config) => config.config_key === 'openingHours'
        );
        setHours(openingHoursConfig.config_value);
        console.log('hours found', openingHoursConfig);
      } catch (error) {
        console.error('Error fetching hours:', error);
      }
    };

    fetchHours();
  }, []);

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

  const handleSave = async () => {
    try {
      const response = await fetch(
        'https://eclipse.cloudylake.io/api/v1/configs/openingHours',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config_value: hours }),
        }
      );

      if (response.ok) {
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
    <div className="w-full h-full mt-16">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <ul>
        {Object.entries(hours).map(([day, details]) => (
          <li key={day}>
            <div className="flex flex-row items-center mb-4 justify-center gap-10">
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
                onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
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
                onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                disabled={!details.isOpen}
                required
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-center mx-auto mt-24">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-[#7c2889] via-[#59277c]  to-[#2a1d54] text-white px-3 py-2 rounded-lg text-sm"
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
}

export default Hours;
