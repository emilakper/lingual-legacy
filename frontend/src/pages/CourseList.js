import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CourseList() {
  const [courses, setCourses] = useState([]);

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

  return (
    <div>
      <h2>Список курсов</h2>
      <ul>
        {courses.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id}>
            <li key={course.id}>{course.title}</li>
          </Link> 
        ))}
      </ul>
    </div>
  );
}

export default CourseList;
