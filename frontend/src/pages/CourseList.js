import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import axios from 'axios';
import Header from '../components/Header';
import apiUrl from '../config';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/v1/courses`);
        setCourses(response.data.courses); 
      } catch (error) {
        console.error("Ошибка при получении курсов:", error);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col"> 
      <Header />

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