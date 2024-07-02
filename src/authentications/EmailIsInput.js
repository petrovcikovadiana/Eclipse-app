//input emails to invite users
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslate } from '@tolgee/react';

const EmailsInput = forwardRef(({ onChange, onError = () => {} }, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState('');
  const { t } = useTranslate();

  const validateEmail = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()\[\]\\.,;:\s@"]+\.)+[^<>()\[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError('');
  };

  const handleInputBlur = () => {
    addEmail();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addEmail();
    } else if (e.key === 'Backspace' && inputValue === '') {
      e.preventDefault();
      removeLastEmail();
    }
  };

  const addEmail = () => {
    const email = inputValue.trim();
    if (validateEmail(email)) {
      if (!emails.includes(email)) {
        const newEmails = [...emails, email];
        setEmails(newEmails);
        setInputValue('');
        onChange(newEmails);
        setError('');
      } else {
        setError('Email already added.');
        onError('Email already added.');
      }
    } else if (email !== '') {
      setError('Please enter a valid email address.');
      onError('Please enter a valid email address.');
    }
  };

  const removeEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
    onChange(newEmails);
  };

  const removeLastEmail = () => {
    if (emails.length > 0) {
      const newEmails = emails.slice(0, -1);
      setEmails(newEmails);
      onChange(newEmails);
    }
  };

  useImperativeHandle(ref, () => ({
    addEmail,
  }));

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center w-full rounded-xl bg-newBackground text-white">
        {emails.map((email, index) => (
          <div
            key={index}
            className="flex items-center bg-darkPink p-2 rounded-xl text-white m-1"
          >
            <span>{email}</span>
            <button
              type="button"
              className="ml-2 text-red-500"
              onClick={() => removeEmail(index)}
            >
              &times;
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={t('input_user_email')}
          className="flex-grow text-white bg-transparent p-2 m-2 outline-none"
        />
      </div>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
});

export default EmailsInput;
