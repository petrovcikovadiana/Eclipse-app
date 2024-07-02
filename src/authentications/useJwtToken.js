import { useState, useEffect } from 'react';

const getCookie = (name) => {
  let cookieArr = document.cookie.split(';');

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split('=');

    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }

  return null;
};

const useJwtToken = (cookieName) => {
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    const token = getCookie(cookieName);
    setJwtToken(token);
  }, [cookieName]);

  return jwtToken;
};

export default useJwtToken;
