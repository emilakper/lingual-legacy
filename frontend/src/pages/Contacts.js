import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

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
      <Header />

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

