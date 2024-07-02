import React from 'react';
import { Link } from 'react-router-dom';

const MenuItem = ({ path, icon, children }) => {
  return (
    <div className="menu-item">
      <Link
        to={path}
        className="flex items-center gap-3 p-2 text-white hover:text-textHover hover:bg-buttonHover rounded-full"
      >
        {icon}
        <span>{children}</span>
      </Link>
    </div>
  );
};

export default MenuItem;
