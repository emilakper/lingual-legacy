import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8081/api/v1/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка при получении профиля пользователя:', error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto py-12 flex-grow">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <img src="/profile-pic-ex.png" alt="Profile" className="w-24 h-24 rounded-full mr-6" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.email}</h2>
              <p className="text-gray-600">ID: {user.id}</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Информация о пользователе</h3>
            <p><span className="font-bold">Email:</span> {user.email}</p>
            <p><span className="font-bold">Дата регистрации:</span> {new Date(user.created_at).toLocaleDateString()}</p>
            {/* Возможно будут новые поля */}
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

export default Profile;