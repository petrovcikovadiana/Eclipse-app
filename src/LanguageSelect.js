import React, { useEffect } from 'react';
import { useTolgee } from '@tolgee/react';
import Select from 'react-select';
import { GrLanguage } from 'react-icons/gr';
import CustomMenu from './pages/Admin-page/CustomMenu';
import DropdownIndicator from './DropdownIndicator';
import Cookies from 'js-cookie';
import { MdPadding } from 'react-icons/md';

export function LanguageSelect() {
  const tolgee = useTolgee(['language']);
  const options = [
    { value: 'en', label: 'English' },
    { value: 'cs-CZ', label: 'Czech' },
    { value: 'sk', label: 'Slovak', className: 'text-blue-200' },
  ];

  useEffect(() => {
    const savedLanguage = Cookies.get('language');

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
      justifyContent: 'center',

      cursor: 'pointer',
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
      backgroundColor: state.isSelected ? '#353C58' : '#242830',
      color: state.isSelected ? '#8E8DF0' : 'white',
      '&:hover': {
        backgroundColor: '#353C58',
        color: '#8E8DF0',
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
      <div className="relative inline-block font-semibold text-white no-underline bg-buttonBlue  group rounded-xl">
        <div className="flex flex-row items-center relative z-10 text-sm rounded-xl">
          <span className="absolute inset-0 overflow-hidden rounded-xl">
            <span className="absolute inset-0 rounded-xl "></span>
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
