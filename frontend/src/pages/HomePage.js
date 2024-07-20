import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import FaqItem from '../components/FaqItem';
import shuffle from 'lodash/shuffle';

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); 
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/v1/courses');
        setCourses(shuffle(response.data.courses).slice(0, 3));
      } catch (error) {
        console.error("Ошибка при получении курсов:", error);
      }
    };

    fetchCourses();
  }, []); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []); 

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
           <div className="text-center mb-8">
             <h2 className="text-4xl font-bold text-gray-800">Изучайте языки всех народов России!</h2>
             <p className="text-lg text-gray-600 mt-4">Начните изучать новые языки с Lingual Legacy.
               У нас вы найдете широкий выбор курсов для всех уровней.
               Присоединяйтесь к нашему сообществу и узнайте больше о языках и культурах России.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {courses.map((course) => (
               <CourseCard key={course.id} course={course} />
             ))}
           </div>

            <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Часто задаваемые вопросы</h2>
            <div>
              <FaqItem question="Как зарегистрироваться на платформе?" answer="Для регистрации перейдите на страницу 'Регистрация', заполните все поля и нажмите 'Зарегистрироваться'." />
              <FaqItem question="Как я могу войти на платформу?" answer="Для входа перейдите на страницу 'Войти', введите свой email и пароль, а затем нажмите 'Войти'." />
              <FaqItem question="Как я могу получить доступ к курсам?" answer="После успешной регистрации или входа, вы можете перейти на страницу 'Курсы' и выбрать нужный курс." />
              <FaqItem question="Как связаться с вами?" answer="Вы можете связаться с нами через форму обратной связи на странице 'Контакты' или написать нам на email: [email@example.com]." />
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

export default HomePage;