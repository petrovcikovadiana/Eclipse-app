import React, { useState, useEffect, useRef } from 'react';
import jsonlint from 'jsonlint-mod';

const JsonInput = ({
  initialConfigKey,
  initialTenantId,
  initialConfigValue,
  onConfigChange,
  isCreate,
}) => {
  const [configKey, setConfigKey] = useState(initialConfigKey);
  const [tenantId, setTenantId] = useState(initialTenantId);
  const [configValue, setConfigValue] = useState(
    isCreate
      ? '{\n\n\n\n\n\n\n\n\n}'
      : JSON.stringify(initialConfigValue || {}, null, 2)
  );
  const [errors, setErrors] = useState({
    configKey: '',
    tenantId: '',
    configValue: '',
  });

  const [tenants, setTenants] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const fetchTenants = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/tenants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.status === 'success') {
          setTenants(result.data.tenants);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      }
    };

    fetchTenants();
  }, [API_URL]);

  useEffect(() => {
    setConfigKey(initialConfigKey);
    setTenantId(initialTenantId);
    setConfigValue(
      isCreate
        ? '{\n\n\n\n\n\n\n\n\n}'
        : JSON.stringify(initialConfigValue || {}, null, 2)
    );
    updateLineNumbers(); // Update line numbers on load
  }, [initialConfigKey, initialTenantId, initialConfigValue, isCreate]);

  useEffect(() => {
    updateLineNumbers(); // Update line numbers on configValue change
  }, [configValue]);

  const validateConfigKey = (value) => {
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        configKey: 'Config Key is required',
      }));
      return false;
    }
    setErrors((prevErrors) => ({ ...prevErrors, configKey: '' }));
    return true;
  };

  const validateTenantId = (value) => {
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        tenantId: 'Tenant ID is required',
      }));
      return false;
    }
    setErrors((prevErrors) => ({ ...prevErrors, tenantId: '' }));
    return true;
  };

  const validateConfigValue = (value) => {
    try {
      jsonlint.parse(value);
      setErrors((prevErrors) => ({ ...prevErrors, configValue: '' }));
      return true;
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        configValue: `Invalid JSON format: ${error.message}`,
      }));
      return false;
    }
  };

  const handleConfigKeyChange = (event) => {
    const value = event.target.value;
    console.log('ConfigKey change:', value);
    setConfigKey(value);
    validateConfigKey(value);
    try {
      onConfigChange(value, tenantId, JSON.parse(configValue));
    } catch (error) {
      console.error('Error parsing JSON in configKey change:', error);
    }
  };

  const handleTenantIdChange = (event) => {
    const value = event.target.value;
    console.log('TenantId change:', value);
    setTenantId(value);
    validateTenantId(value);
    try {
      onConfigChange(configKey, value, JSON.parse(configValue));
    } catch (error) {
      console.error('Error parsing JSON in tenantId change:', error);
    }
  };

  const handleConfigValueChange = (event) => {
    const value = event.target.value;
    setConfigValue(value);
  };

  const handleValidate = () => {
    try {
      const parsedValue = JSON.parse(configValue);
      console.log('Before onConfigChange:', configKey, tenantId, parsedValue);

      validateConfigValue(configValue);
      onConfigChange(configKey, tenantId, parsedValue); // Update parent with new value only if valid JSON
      console.log('After onConfigChange:', configValue);
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        configValue: `Invalid JSON format: ${error.message}`,
      }));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Set textarea value to: text before caret + tab + text after caret
      setConfigValue(
        configValue.substring(0, start) + '\t' + configValue.substring(end)
      );

      // Put caret at right position again
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(configValue);
      const beautified = JSON.stringify(parsed, null, 2);
      setConfigValue(beautified);
      setErrors((prevErrors) => ({ ...prevErrors, configValue: '' }));
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        configValue: 'Invalid JSON format',
      }));
    }
  };

  const updateLineNumbers = () => {
    const lineCount = (configValue || '').split('\n').length;
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join(
      '\n'
    );
    if (lineNumberRef.current) {
      lineNumberRef.current.value = lineNumbers;
    }
  };

  const handleScroll = () => {
    if (lineNumberRef.current && textareaRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div>
      <label className="block mb-4">
        <span className="text-white">Config Key:</span>
        <input
          type="text"
          value={configKey}
          onChange={handleConfigKeyChange}
          className="mt-1 block w-full p-2 bg-newBackground rounded-md shadow-sm focus:ring focus:ring-opacity-50"
        />
      </label>
      <label className="block mb-4">
        <span className="text-white">Tenant ID:</span>
        <select
          value={tenantId}
          onChange={handleTenantIdChange}
          className="mt-1 block w-full p-2 bg-newBackground rounded-md shadow-sm focus:ring focus:ring-opacity-50"
        >
          <option value="">Select a tenant</option>
          {tenants.map((tenant) => (
            <option key={tenant._id} value={tenant.tenantId}>
              {tenant.tenantName}
            </option>
          ))}
        </select>
      </label>
      <label className="block mb-4 relative">
        <span className="text-white">Config Value (JSON):</span>
        <button
          onClick={handleBeautify}
          className="absolute right-0 top-0 mr-2 text-buttonBlue"
        >
          Beautify
        </button>
        <div className="relative flex">
          <textarea
            ref={lineNumberRef}
            className=" mt-1 block p-2 w-12 text-gray-500 bg-newBackground rounded-l-md shadow-sm border-r-0 resize-none"
            readOnly
          />
          <textarea
            ref={textareaRef}
            value={configValue}
            onChange={handleConfigValueChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder="Enter raw JSON here"
            rows="10"
            className="mt-1 block w-full p-2 text-white bg-newBackground rounded-r-md shadow-sm resize-none textarea-dots textarea-brackets"
          />
        </div>
      </label>
      <button
        onClick={handleValidate}
        className="mt-2 px-4 py-2 bg-buttonHover text-white rounded-md "
      >
        Validate JSON
      </button>
      {errors.configValue && (
        <p className="text-red-500 text-sm">{errors.configValue}</p>
      )}
    </div>
  );
};

export default JsonInput;
