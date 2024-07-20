import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Contacts() {

const [isLoggedIn, setIsLoggedIn] = useState(false);

const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); 
    };

    useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
    }, []); 

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col"> 
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
            <div className="flex space-x-4">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Выйти</button> 
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

      <main className="container mx-auto py-12 flex-grow"> 
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">Контакты</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-md shadow-md">
            <h3 className="text-2xl font-bold mb-4">Адрес</h3>
            <p className="text-gray-600">г. Москва, Ленинский пр-т., д. 4</p>
          </div>
          <div className="p-6 bg-white rounded-md shadow-md">
            <h3 className="text-2xl font-bold mb-4">Email</h3>
            <p className="text-gray-600">info@linguallegacy.com</p>
          </div>
          <div className="p-6 bg-white rounded-md shadow-md">
            <h3 className="text-2xl font-bold mb-4">Телефон</h3>
            <p className="text-gray-600">+7 (777) 777-52-52</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-200 py-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">© 2024 Lingual Legacy</p>
        </div>
      </footer>
    </div>
  );
}

export default Contacts;

