import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaHammer } from 'react-icons/fa';

function Hero() {
  return (
    <div className="flex h-auto items-center justify-center text-white gap-3 pt-16">
      <FaHammer />
      <h1>Dashboard in progress</h1>
    </div>
  );
}

export default Hero;
