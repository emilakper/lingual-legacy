import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Dropdown from './Dropdown';
import axios from 'axios';
import apiUrl from '../config';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Получение email пользователя
      axios.get(`${apiUrl}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        setUserEmail(response.data.email);
      })
      .catch(error => {
        console.error('Ошибка при получении данных пользователя:', error);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-[#102e44] shadow-md">
      <div className="container mx-auto py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo-new.png" alt="Lingual Legacy" className="w-10 h-auto" />
            <h1 className="text-white text-xl font-bold ml-4">Lingual Legacy</h1>
          </Link>
        </div>
        <nav className="flex justify-between space-x-4">
          <div className="flex space-x-4">
            <Link to="/courses" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Курсы</Link>
            <Link to="/about" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">О нас</Link>
            <Link to="/contacts" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Контакты</Link>
          </div>
          <div className="flex space-x-4 ">
            {isLoggedIn ? (
              // <Dropdown name={userName} />
              <Dropdown email={userEmail}/>
            ) : (
              <>
                <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Войти</Link>
                <Link to="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Регистрация</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;