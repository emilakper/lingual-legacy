import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
      localStorage.removeItem('token');
      setIsLoggedIn(false); 
      };


  useEffect(() => {
    const fetchLesson = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8081/api/v1/lessons/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLesson(response.data);
      } catch (error) {
        console.error('Ошибка при получении урока:', error);
        // ... Обработка ошибки ...
      }
    };

    fetchLesson();
  }, [id, navigate]);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8081/api/v1/lessons/${id}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("RESPONSE.DATA",response.data)
        setTasks(response.data.tasks);
      } catch (error) {
        console.error('Ошибка при получении заданий:', error);
        // ... Обработка ошибки ...
      }
    };

    fetchTasks();
  }, [id, navigate]);

  if (!lesson) {
    return <div>Загрузка урока...</div>;
  }

  const handleOptionClick = (taskId, optionId) => {
    if (selectedOptions[taskId] !== undefined) {
      return;
    }
  
    setSelectedOptions({ ...selectedOptions, [taskId]: optionId }); 
    setShowAnswer(true);
  };

  const isOptionCorrect = (optionId) => {
    const currentTask = tasks[0].task_options.find(option => option.id === optionId);
    return currentTask !== undefined && currentTask.is_correct === true;
  };

  const restartTest = () => {
    setSelectedOptions({});
    setShowAnswer(false); 
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-[#102e44] shadow-md">
        <div className="container mx-auto py-4 flex justify-between items-center"> 
          <div className="flex items-center"> 
            <Link to="/" className="flex items-center">
              <img src="/logo-new.png" alt="Lingual Legacy" className="w-10 h-auto" />
              <h1 className="text-white text-xl font-bold ml-4">Lingual Legacy</h1>
            </Link> 
          </div>
          <nav className="flex justify-between space-x-4"> 
            <div className="flex space-x-4">
              <Link to="/courses" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Курсы</Link> 
              <Link to="/about" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">О нас</Link>  
              <Link to="/contacts" className="flex items-center py-2 px-4 text-white hover:bg-gray-200 hover:text-gray-800 transition duration-300 ease-in-out">Контакты</Link>  
            </div>
            <div className="flex space-x-4">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Выйти</button> 
              ) : (
                <>
                  <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Войти</Link>
                  <Link to="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Регистрация</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 flex-grow"> 
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">{lesson.title}</h2>
        </div>
        <div className="p-4 bg-white rounded-md shadow-md mb-4">
          <p className="text-gray-600">{lesson.content}</p>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800">Тест</h3>
        </div>
        {tasks.map((task, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-lg font-bold text-gray-800">{task.task.content}</h4>
            <ul>
              {task.task_options.map((option) => (
                <li 
                  key={option.id} 
                  className={`block p-4 bg-white rounded-md shadow-md mb-4 hover:bg-gray-100 transition duration-150 ease-in-out 
                         ${showAnswer && selectedOptions[task.task.id] === option.id && (isOptionCorrect(option.id) ? 'bg-green-100' : 'bg-red-100')}`} 
                > 
                  <button onClick={() => handleOptionClick(task.task.id, option.id)} className="w-full text-left focus:outline-none focus:shadow-outline">
                    {option.text} 
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex justify-center mt-4"> 
            <button onClick={() => navigate(`/courses/${lesson.course_id}`)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">Завершить урок</button>
            <button onClick={restartTest} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Попробовать заново</button>
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

export default Lesson;