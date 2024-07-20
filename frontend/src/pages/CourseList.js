import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import axios from 'axios';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/v1/courses');
        setCourses(response.data.courses); 
      } catch (error) {
        console.error("Ошибка при получении курсов:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); 
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []); 

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center mb-4">
          <input 
            type="text" 
            placeholder="Поиск курсов" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} /> 
          ))}
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

export default CourseList;