import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LessonModal from '../components/LessonModal';
import { toast } from 'react-toastify';
import apiUrl from '../config';

function AdminLessons() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null); 

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login'); 
  };

  const fetchLessons = useCallback(async () => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/admin/lessons`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setLessons(response.data.lessons);
    } catch (error) {
      console.error("Ошибка получения уроков:", error);
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  }, [navigate]);

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
    fetchLessons();
    fetchCourses();
  }, [fetchLessons, fetchCourses]);

  const handleDeleteLesson = async (lessonId) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`${apiUrl}/admin/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      // Обновить список уроков после удаления
      fetchLessons(); 
      toast.success('Урок успешно удален');
    } catch (error) {
      console.error("Ошибка удаления урока:", error);
      toast.error('Ошибка при удалении урока');
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  const handleCreateLesson = () => {
    setIsModalOpen(true);
    setSelectedLesson(null); 
  };

  const handleEditLesson = (lesson) => {
    setIsModalOpen(true);
    setSelectedLesson(lesson);
  };

  const handleSaveLesson = async (updatedLesson) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      if (selectedLesson) {
        // Обновление существующего урока
        await axios.put(`${apiUrl}/admin/lessons/${selectedLesson.id}`, {
          title: updatedLesson.title,
          content: updatedLesson.content,
          course_id: parseInt(updatedLesson.course_id, 10)
        }, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
      } else {
        // Создание нового урока
        await axios.post(`${apiUrl}/admin/lessons`, {
          title: updatedLesson.title,
          content: updatedLesson.content,
          course_id: parseInt(updatedLesson.course_id, 10)
        }, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
      }
      // Обновление списка уроков
      fetchLessons();
      setIsModalOpen(false); 
      toast.success('Изменения применены успешно');
    } catch (error) {
      console.error("Ошибка сохранения урока:", error);
      toast.error('Изменения не применены');
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Уроки</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Содержание</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-100 transition duration-300 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lesson.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lesson.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lesson.content}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(lesson.created_at).toLocaleString('en-US', {
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
                      <button onClick={() => handleEditLesson(lesson)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Редактировать</button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handleCreateLesson} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">Создать урок</button>
        <LessonModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          lesson={selectedLesson}
          onSave={handleSaveLesson}
          onDelete={handleDeleteLesson}
          courses={courses}
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

export default AdminLessons;