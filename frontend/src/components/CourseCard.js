import React from 'react';
import { Link } from 'react-router-dom';

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="bg-white shadow-md rounded-md overflow-hidden hover:scale-105 transition duration-300 ease-in-out">
      <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
        <p className="text-gray-600 text-sm mt-2">{course.description}</p>
      </div>
    </Link>
  );
}

export default CourseCard;

