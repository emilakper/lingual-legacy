import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Course() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
      localStorage.removeItem('token');
      setIsLoggedIn(false); 
      };

      useEffect(() => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token); 
      }, []); 
  
      useEffect(() => {
        const fetchCourse = async () => {
          try {
            const response = await axios.get(`http://localhost:8081/api/v1/courses/${id}`);
            setCourse(response.data); 
          } catch (error) {
            console.error("Ошибка при получении курса:", error);
          }
        };
    
        fetchCourse();
      }, [id]);

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8081/api/v1/courses/${id}/lessons`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLessons(response.data);
      } catch (error) {
        console.error('Ошибка при получении курса и уроков:', error);
        // ... Обработка ошибки (отображение сообщения об ошибке)
      }
    };

    fetchCourseAndLessons();
  }, [id, navigate]);

  if (!course) {
    return <div>Загрузка курса...</div>; 
  }

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
          <h2 className="text-3xl font-bold text-gray-800">{course.title}</h2>
        </div>
        <div className="p-4 bg-white rounded-md shadow-md mb-4">
          <p className="text-gray-600">{course.description}</p>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800">Уроки</h3>
        </div>
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link to={`/lessons/${lesson.id}`} className="block p-4 bg-white rounded-md shadow-md mb-4 hover:bg-gray-100 transition duration-300 ease-in-out">
                <h4 className="text-lg font-bold text-gray-800">{lesson.title}</h4>
                <p className="text-gray-600">{lesson.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="bg-gray-200 py-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">© 2024 Lingual Legacy</p>
        </div>
      </footer>
    </div>
  );
}

export default Course;