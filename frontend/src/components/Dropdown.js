import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function Dropdown({ email }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div className="relative inline-block text-left" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-green-500 shadow-sm px-4 py-2 
          bg-green-500 text-sm font-medium text-gray-700 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="options-menu"
          aria-expanded="true"
          aria-haspopup="true"
        >
          {email}
        </button>
      </div>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" 
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby="options-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="py-1" role="none">
            <Link to="/profile" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Мой профиль</Link>
            <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">Выйти</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;