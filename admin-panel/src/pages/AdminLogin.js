import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../config';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/admin/auth/login`, {
        email,
        password,
      });
      console.log('Токен:', response.data.token);
      localStorage.setItem('adminToken', response.data.token);

      navigate('/'); 
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      alert('Неверный email или пароль');
    }
  };

  return (
    <div className="bg-[#102e44] min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Вход в админ-панель</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus-shadow-outline">
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;

