import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskModal from '../components/TaskModal';
import { toast } from 'react-toastify';
import apiUrl from '../config';

function AdminTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const fetchTasks = useCallback(async () => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/admin/tasks`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Ошибка получения заданий:", error);
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  }, [navigate]);

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
      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error("Ошибка получения уроков:", error);
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  }, [navigate]);

  const fetchTaskOptions = async (taskId) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/admin/task_options/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      return response.data.task_options;
    } catch (error) {
      console.error("Ошибка получения вариантов ответов:", error);
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchLessons();
  }, [fetchTasks, fetchLessons]);

  const handleDeleteTask = async (taskId) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`${apiUrl}/admin/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      // Обновить список заданий после удаления
      fetchTasks();
      toast.success('Задание успешно удалено');
    } catch (error) {
      console.error("Ошибка удаления задания:", error);
      toast.error('Ошибка при удалении задания');
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  const handleCreateTask = () => {
    setIsModalOpen(true);
    setSelectedTask(null);
  };

  const handleEditTask = async (task) => {
    const options = await fetchTaskOptions(task.id);
    setSelectedTask({ ...task, task_options: options });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (updatedTask) => {
    const adminToken = localStorage.getItem('adminToken');
  
    if (!adminToken) {
      navigate('/login');
      return;
    }
  
    try {
      let response;
      if (selectedTask) {
        // Обновление существующего задания
        response = await axios.put(`${apiUrl}/admin/tasks/${selectedTask.id}`, {
          title: updatedTask.title,
          content: updatedTask.content,
          lesson_id: parseInt(updatedTask.lesson_id, 10),
          task_type: updatedTask.task_type,
        }, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
  
        // Обновление или удаление вариантов ответов
        const originalOptions = selectedTask.task_options || [];
        const updatedOptions = updatedTask.task_options || [];
  
        // Удаление вариантов ответов, которые были удалены на клиенте
        for (const originalOption of originalOptions) {
          const optionExists = updatedOptions.some(option => option.id === originalOption.id);
          if (!optionExists) {
            await axios.delete(`${apiUrl}/admin/task_options/${originalOption.id}`, {
              headers: {
                Authorization: `Bearer ${adminToken}`,
              },
            });
          }
        }
  
        // Обновление или добавление вариантов ответов
        for (const option of updatedOptions) {
          if (option.id) {
            await axios.put(`${apiUrl}/admin/task_options/${option.id}`, {
              task_id: selectedTask.id,
              text: option.text,
              is_correct: option.is_correct,
            }, {
              headers: {
                Authorization: `Bearer ${adminToken}`,
              },
            });
          } else {
            await axios.post(`${apiUrl}/admin/task_options`, {
              task_id: selectedTask.id,
              text: option.text,
              is_correct: option.is_correct,
            }, {
              headers: {
                Authorization: `Bearer ${adminToken}`,
              },
            });
          }
        }
      } else {
        // Создание нового задания
        response = await axios.post(`${apiUrl}/admin/tasks`, {
          title: updatedTask.title,
          content: updatedTask.content,
          lesson_id: parseInt(updatedTask.lesson_id, 10),
          task_type: updatedTask.task_type,
        }, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
  
        // Создание вариантов ответов
        for (const option of updatedTask.task_options) {
          await axios.post(`${apiUrl}/admin/task_options`, {
            task_id: response.data.task_id,
            text: option.text,
            is_correct: option.is_correct,
          }, {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          });
        }
      }
      // Обновление списка заданий
      fetchTasks();
      setIsModalOpen(false);
      toast.success('Изменения применены успешно');
    } catch (error) {
      console.error("Ошибка сохранения задания:", error);
      toast.error('Изменения не применены');
      // Добавить обработку ошибки, например, отображение сообщения пользователю
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Задания</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип задания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Содержание</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Урок</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-100 transition duration-300 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.task_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.content}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.lesson_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(task.created_at).toLocaleString('en-US', {
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
                      <button onClick={() => handleEditTask(task)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Редактировать</button>
                      <button onClick={() => handleDeleteTask(task.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handleCreateTask} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">Создать задание</button>
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          task={selectedTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          lessons={lessons}
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

export default AdminTasks;