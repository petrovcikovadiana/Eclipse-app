import React from 'react';
import { components } from 'react-select';
import { GrLanguage } from 'react-icons/gr';

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <GrLanguage />
    </components.DropdownIndicator>
  );
};

export default DropdownIndicator;
