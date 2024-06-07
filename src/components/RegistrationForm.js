import React, { useState } from 'react';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    password: '',
  });
  const [errors, setErrors] = useState({ password: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'title') {
      // Automatické generování slugu při změně titulu
      const slugValue = value
        .toLowerCase()
        .normalize('NFD') // Normalize string to NFD form
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
      setFormData((prevData) => ({
        ...prevData,
        slug: slugValue,
      }));
    }
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePassword(formData.password)) {
      setErrors({
        password:
          'Password must be at least 6 characters long, contain at least one letter, one number, and one special character.',
      });
      return;
    }
    // Submit the form
    console.log('Form submitted', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-[#30323f] to-[#dce7fa] text-violet-300">
      <div className="flex flex-col w-1/3 bg-[#121827] p-10 rounded-xl">
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {/* name */}
          <h1 className="text-lineGrey">Name</h1>
          <input
            type="text"
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4"
            placeholder="Name"
            name="title"
            onChange={handleInputChange}
            value={formData.title}
          />
          {/* slug */}
          <h1 className="text-lineGrey">Slug</h1>
          <input
            type="text"
            name="slug"
            className="rounded-lg bg-background text-lineGrey py-2 w-full px-4"
            onChange={handleInputChange}
            value={formData.slug}
            disabled
          />
          {/* email */}
          <h1 className="text-lineGrey">Email</h1>
          <input
            type="text"
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4"
            placeholder="Email"
          />

          {/* date */}
          <h1 className="text-lineGrey">Date</h1>
          <input
            type="text"
            className="rounded-lg bg-background text-white py-2 w-full px-4"
            placeholder="Date"
          />
          {/* description */}
          <h1 className="text-lineGrey">Description</h1>
          <input
            type="text"
            name="description"
            placeholder="Description"
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4 mb-2"
          />
          {/* password */}
          <h1 className="text-lineGrey">Password</h1>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4 mb-2"
            onChange={handleInputChange}
            value={formData.password}
          />
          {/* confirm email */}
          <h1 className="text-lineGrey">Confirm your password</h1>
          <input
            type="password"
            className="rounded-lg bg-darkPink text-white py-2 w-full px-4"
            placeholder="Confirm your password"
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
          <input
            type="submit"
            className="bg-[#e25b76] py-2 rounded-lg w-24 items-center justify-center mx-auto"
          />
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
