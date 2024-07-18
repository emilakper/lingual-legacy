import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:8081/api/v1/auth/login', {
        email,
        password,
      });

      console.log('Вход выполнен:', response.data);
      localStorage.setItem('token', response.data.token); // Сохраняем токен в localStorage
      navigate('/'); // Переход на главную страницу после входа
    } catch (error) {
      console.error('Ошибка при входе:', error);
      // ... (Обработка ошибки, пока что просто выводим в консоль)
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;