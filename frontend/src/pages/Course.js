import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Course() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

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

        setCourse(response.data[0]);
        setLessons(response.data);
      } catch (error) {
        console.error('Ошибка при получении курса и уроков:', error);
        // ... Обработка ошибки (отображение сообщения об ошибке)
      }
    };

    fetchCourseAndLessons();
  }, [id]);

  if (!course) {
    return <div>Загрузка курса...</div>; 
  }

  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>

      <h3>Уроки:</h3>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            {lesson.title} 
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Course;

