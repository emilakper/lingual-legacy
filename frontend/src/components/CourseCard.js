import React from 'react';

function CourseCard({ course }) { // Получаем course как проп
  return (
    <div className="course-card"> 
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      {/*... (сюда можно добавить кнопку "Начать обучение" позже)*/}
    </div>
  );
}

export default CourseCard;