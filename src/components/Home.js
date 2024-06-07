// Home.js
import React from 'react';
import Admin from './Admin'; // Import administračního rozhraní
import PostContent from './PostContent'; // Import obsahu PostContent
import { useLocation } from 'react-router-dom';

function Home() {
  const location = useLocation(); // Získání aktuálního umístění pomocí hooku useLocation()

  return (
    <>
      {/* Zobrazení obsahu podle aktuálního umístění */}
      {location.pathname === '/admin' ? <Admin /> : <PostContent />}
    </>
  );
}

export default Home;
