import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserModal from '../components/UserModal';

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login'); 
  };

  const fetchUsers = useCallback(async () => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8081/admin/users', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Ошибка получения пользователей:", error);
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  },[navigate]);


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:8081/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      // Обновить список пользователей после удаления
      fetchUsers(); 
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  const handleCreateUser = () => {
    setIsModalOpen(true);
    setSelectedUser(null); 
  };

  const handleEditUser = (user) => {
    setIsModalOpen(true);
    setSelectedUser(user);
    console.log(selectedUser)
  };

  const handleSaveUser = async (updatedUser) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

  try {
    let response;
    if (selectedUser) {
      //  Обновление  существующего  пользователя
      response = await axios.put(`http://localhost:8081/admin/users/${selectedUser.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
    } else {
      //  Создание  нового  пользователя
      response = await axios.post('http://localhost:8081/admin/users', updatedUser, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
    }
    // Обновление  списка  пользователей
    fetchUsers();
    setIsModalOpen(false); 
  } catch (error) {
    console.error("Ошибка сохранения пользователя:", error);
    // Добавить обработку ошибки, например, отображение сообщения пользователю
  }
};

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-[#102e44] shadow-md">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-white text-xl font-bold">Административная панель</h1>
          </div>
          <nav className="flex justify-between space-x-4">
            <div className="flex space-x-4">
              <Link to="/admin/users" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Пользователи</Link>
              <Link to="/admin/courses" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Курсы</Link>
              <Link to="/admin/lessons" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Уроки</Link>
              <Link to="/admin/tasks" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Задания</Link>
            </div>
            <div className="flex space-x-4">
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Выйти</button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 flex-grow">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Пользователи</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Администратор</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-100 transition duration-300 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.is_admin ? 'Да' : 'Нет'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditUser(user)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Редактировать</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handleCreateUser} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">Создать пользователя</button>
        <UserModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          user={selectedUser}
          onSave={handleSaveUser}
          onDelete={handleDeleteUser}
        />
      </main>

      <footer className="bg-gray-200 py-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">© 2024 Lingual Legacy</p>
        </div>
      </footer>
    </div>
  );
}

export default AdminUsers;