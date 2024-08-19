import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseModal from '../components/CourseModal';
import { toast } from 'react-toastify';
import apiUrl from '../config';

function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); 

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login'); 
  };

  const fetchCourses = useCallback(async () => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/admin/courses`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Ошибка получения курсов:", error);
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  }, [navigate]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDeleteCourse = async (courseId) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`${apiUrl}/admin/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      // Обновить список курсов после удаления
      fetchCourses(); 
      toast.success('Курс успешно удален');
    } catch (error) {
      console.error("Ошибка удаления курса:", error);
      toast.error('Ошибка при удалении курса');
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  const handleCreateCourse = () => {
    setIsModalOpen(true);
    setSelectedCourse(null); 
  };

  const handleEditCourse = (course) => {
    setIsModalOpen(true);
    setSelectedCourse(course);
  };

  const handleSaveCourse = async (updatedCourse) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      if (selectedCourse) {
        // Обновление существующего курса
        await axios.put(`${apiUrl}/admin/courses/${selectedCourse.id}`, updatedCourse, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
      } else {
        // Создание нового курса
        await axios.post(`${apiUrl}/admin/courses`, updatedCourse, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
      }
      // Обновление списка курсов
      fetchCourses();
      setIsModalOpen(false); 
      toast.success('Изменения применены успешно');
    } catch (error) {
      console.error("Ошибка сохранения курса:", error);
      toast.error('Изменения не применены');
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-[#102e44] shadow-md">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo-new.png" alt="Lingual Legacy" className="w-10 h-auto mr-2" />
            <h1 className="text-white text-xl font-bold">Административная панель</h1>
          </Link>
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Курсы</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-100 transition duration-300 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(course.created_at).toLocaleString('en-US', {
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
                      <button onClick={() => handleEditCourse(course)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Редактировать</button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handleCreateCourse} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">Создать курс</button>
        <CourseModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          course={selectedCourse}
          onSave={handleSaveCourse}
          onDelete={handleDeleteCourse}
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

export default AdminCourses;