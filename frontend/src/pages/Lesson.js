import React, { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import apiUrl from '../config';

function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLesson = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/api/v1/lessons/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLesson(response.data);
      } catch (error) {
        console.error('Ошибка при получении урока:', error);
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
        const response = await axios.get(`${apiUrl}/api/v1/lessons/${id}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error('Ошибка при получении заданий:', error);
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
    const currentTask = tasks.find(task => task.task_options.some(option => option.id === optionId));
    if (!currentTask) {
      return false;
    }
    const currentOption = currentTask.task_options.find(option => option.id === optionId);
    if (!currentOption) {
      return false;
    }
    return currentOption.is_correct === true;
  };

  const restartTest = () => {
    setSelectedOptions({});
    setShowAnswer(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header />

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
                  className={`block p-4 rounded-md shadow-md mb-4 transition duration-150 ease-in-out
                             ${showAnswer && selectedOptions[task.task.id] === option.id
                      ? isOptionCorrect(option.id) ? 'bg-green-400' : 'bg-red-400'
                      : 'bg-white hover:bg-gray-100'}`}
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