import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import apiUrl from '../config';

function Profile() {
  const [user, setUser] = useState(null);
  //она пытается редактировать
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        //
        setEditedUser(response.data);
      } catch (error) {
        console.error('Ошибка при получении профиля пользователя:', error);
      }
    };

    fetchUserProfile();
  }, [navigate]);


  // биб биб биб биб 
  const handleEdit = () => { // Добавлено: функция для активации режима редактирования
    setIsEditing(true);
  };

  const handleSave = async () => { // Добавлено: функция для сохранения изменений
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Ошибка: пользователь не аутентифицирован');
      return;
    }

    try {
      const response = await axios.put(`${apiUrl}/api/v1/users/me`, editedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setIsEditing(false); // Отключаем режим редактирования после сохранения
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
    }
  };

  const handleChange = (e) => { // Добавлено: обработчик изменений в форме редактирования
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };



  if (!user) {
    return <div>Загрузка...</div>;
  }



  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

      <main className="container mx-auto py-12 flex-grow">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <img src="/profile-pic-ex-i.png" alt="Profile" className="w-24 h-24 rounded-full mr-6" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.email}</h2>
              <p className="text-gray-600">ID: {user.id}</p>
            </div>
          </div>
          <div>
          {/* {она начала рабоать офигетбл} */}
          {isEditing ? (<></>) :
          (<button
              onClick={handleEdit}
              className="bg-green-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded">Редактировать
            </button>
          )}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Информация о пользователе</h3>



            {/* {она начала рабоать офигетбл} */}
            {isEditing ? ( // Условный рендеринг для режима редактирования
              <>
                <p><span className="font-bold">Email:</span> {user.email}</p>
                <p><span className="font-bold">Дата регистрации:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                {/* Новые смешные поля */}
                <p><span className="font-bold">Статус:</span> {user.is_admin ? "Мастер" : "Студент"}</p>
                <p>
                  <span className="font-bold">Имя пользователя:</span>
                  <input
                    name="username"
                    value={editedUser.username || ''}
                    onChange={handleChange}
                    className="border p-1 w-full mt-2"
                  />
                </p>
                <div className="flex space-x-4">
                <button onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-10 rounded mt-4">Сохранить</button>
                <button onClick= {handleCancel} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-10 rounded mt-4">Отменить</button>
                </div>
              </>
            ) : (
              <>

                <p><span className="font-bold">Email:</span> {user.email}</p>
                <p><span className="font-bold">Дата регистрации:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                {/* Новые смешные поля */}
                <p><span className="font-bold">Статус:</span> {user.is_admin ? "Мастер" : "Студент"}</p>
                <p><span className="font-bold">Имя пользователя:</span> {user.username}</p>
              </>
            )}
            {/* она закончила */}




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