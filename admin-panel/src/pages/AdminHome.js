import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import apiUrl from '../config';

Chart.register(...registerables);

function AdminHome() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [userChartData, setUserChartData] = useState({});

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login'); 
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      navigate('/login'); 
    }

    // Получаем статистику
    const fetchStats = async () => {
      try {
        const [userResponse, courseResponse, lessonResponse, taskResponse] = await Promise.all([
          axios.get(`${apiUrl}/admin/users`, {
            headers: {
              Authorization: `Bearer ${adminToken}`, 
            },
          }),
          axios.get(`${apiUrl}/admin/courses`, {
            headers: {
              Authorization: `Bearer ${adminToken}`, 
            },
          }),
          axios.get(`${apiUrl}/admin/lessons`, {
            headers: {
              Authorization: `Bearer ${adminToken}`, 
            },
          }),
          axios.get(`${apiUrl}/admin/tasks`, {
            headers: {
              Authorization: `Bearer ${adminToken}`, 
            },
          }),
        ]);

        setUserCount(userResponse.data.userCount);
        setCourseCount(courseResponse.data.coursesCount);
        setLessonCount(lessonResponse.data.lessonsCount);
        setTaskCount(taskResponse.data.tasksCount);
      } catch (error) {
        console.error("Ошибка получения статистики:", error);
        // Добавить обработку ошибки, например, отображение сообщения пользователю
      }
    };

    // Получаем данные для графика пользователей
    const fetchUserChartData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/admin/users/chart`, {
          headers: {
            Authorization: `Bearer ${adminToken}`, 
          },
        });
        setUserChartData(response.data);
      } catch (error) {
        console.error("Ошибка получения данных для графика пользователей:", error);
        // Добавить обработку ошибки, например, отображение сообщения пользователю
      }
    };

    fetchStats();
    fetchUserChartData();
  }, [navigate]); 

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800">Пользователи</h2>
            <p className="text-gray-600 text-lg">{userCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800">Курсы</h2>
            <p className="text-gray-600 text-lg">{courseCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800">Уроки</h2>
            <p className="text-gray-600 text-lg">{lessonCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800">Задания</h2>
            <p className="text-gray-600 text-lg">{taskCount}</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Динамика пользователей</h2>
          {userChartData.labels ? (
            <Line
              data={{
                labels: userChartData.labels,
                datasets: [
                  {
                    label: 'Количество пользователей',
                    data: userChartData.data,
                    fill: false,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                  },
                ],
              }}
              options={{
                scales: {
                  x: {
                    type: 'category',
                  },
                  y: {
                    type: 'linear',
                    beginAtZero: true,
                  },
                },
              }}
            />
          ) : (
            <p>Загрузка данных...</p>
          )}
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

export default AdminHome;