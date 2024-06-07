// CustomMenu.js
import React from 'react';
import { components } from 'react-select';

const CustomMenu = (props) => {
  return (
    <components.Menu {...props} className="react-select__menu">
      {props.children}
    </components.Menu>
  );
};

export default CustomMenu;
