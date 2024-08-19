import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import apiUrl from '../config';

function Course() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();
  
      useEffect(() => {
        const fetchCourse = async () => {
          try {
            const response = await axios.get(`${apiUrl}/api/v1/courses/${id}`);
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
        const response = await axios.get(`${apiUrl}/api/v1/courses/${id}/lessons`, {
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
      <Header />

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