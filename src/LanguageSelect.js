import React, { useEffect } from 'react';
import { useTolgee } from '@tolgee/react';
import Select from 'react-select';
import { GrLanguage } from 'react-icons/gr';
import CustomMenu from './components/CustomMenu';
import DropdownIndicator from './DropdownIndicator';
import Cookies from 'js-cookie';

export function LanguageSelect() {
  const tolgee = useTolgee(['language']);
  const options = [
    { value: 'en', label: 'English' },
    { value: 'cs-CZ', label: 'Czech' },
    { value: 'sk', label: 'Slovak', className: 'text-blue-200' },
  ];

  useEffect(() => {
    const savedLanguage = Cookies.get('language');
    console.log('Saved language from cookies:', savedLanguage); // Debug log

    if (savedLanguage) {
      tolgee.changeLanguage(savedLanguage);
    }
  }, [tolgee]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      '&:hover': {
        border: 'none',
      },
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '10px', // Add left padding to accommodate the icon
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#28243c',
      borderRadius: '8px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#312d4a' : '#28243c',
      color: state.isSelected ? '#7c2889' : 'white',
      '&:hover': {
        backgroundColor: '#312d4a',
        color: '#7c2889',
      },
      display: 'flex',
      alignItems: 'center',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
    }),
  };

  const handleLanguageChange = (selectedOption) => {
    const language = selectedOption.value;
    tolgee.changeLanguage(language);
    Cookies.set('language', language, { expires: 365 }); // Save the selected language in cookies for 1 year
  };

  return (
    <div>
      <div className="relative inline-block p-px font-semibold leading-6 text-white no-underline 8b58fa shadow-2xl bg-gradient-to-r from-[#7c2889] via-[#59277c] to-[#2a1d54] cursor-pointer group rounded-xl shadow-zinc-900">
        <div className="flex flex-row items-center relative z-10 text-sm rounded-xl">
          {/* <GrLanguage className="ml-3" /> Add the icon here */}
          <span className="absolute inset-0 overflow-hidden rounded-xl">
            <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
          </span>
          <Select
            value={options.find(
              (option) => option.value === tolgee.getLanguage()
            )}
            onChange={handleLanguageChange}
            options={options}
            styles={customStyles}
            className="bg-transparent z-20"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            components={{
              Menu: CustomMenu,
            }}
          />
        </div>
      </div>
    </div>
  );
}
