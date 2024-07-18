import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    const handleLogout = () => {
      localStorage.removeItem('token');
    };
  
    return (
      <div>
        <h1>Добро пожаловать в Lingual Legacy!</h1>
        <p>Изучайте языки всех народов России!</p>
        <Link to="/courses">
          <button>Просмотреть курсы</button>
        </Link>
        <br/>
        <Link to="/login">
          <button>Войти</button> 
        </Link>
        <br/>
        <Link to="/register">
          <button>Регистрация</button> 
        </Link>
        <br/>
        <button onClick={handleLogout}>Выйти из профиля</button>
      </div>
    );
  }
  
  export default HomePage;