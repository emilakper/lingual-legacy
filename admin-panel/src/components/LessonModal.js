import React, { useEffect, useState } from 'react';

function LessonModal({ isOpen, onClose, lesson, onSave, onDelete, courses }) {
  const [title, setTitle] = useState(lesson ? lesson.title : '');
  const [content, setContent] = useState(lesson ? lesson.content : '');
  const [courseId, setCourseId] = useState(lesson ? lesson.course_id : '');

  const handleSave = () => {
    onSave({ title, content, course_id: courseId }); 
    onClose(); 
  };

  const handleDelete = () => {
    onDelete(lesson.id); 
    onClose(); 
  };

  useEffect(() => {
    if (lesson){
        setTitle(lesson.title);
        setContent(lesson.content);
        setCourseId(lesson.course_id);
    } else {
        setTitle('');
        setContent('');
        setCourseId('');
    }
  }, [lesson]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setCourseId('');
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'} bg-gray-500 bg-opacity-50`}> 
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {lesson ? 'Редактировать урок' : 'Создать урок'}
        </h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Название</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-gray-700 font-bold mb-2">Содержание</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="courseId" className="block text-gray-700 font-bold mb-2">Курс</label>
            <select
              id="courseId"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Выберите курс</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Отмена
            </button>
            {lesson && (
              <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
                Удалить
              </button>
            )}
            <button type="button" onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2">
              {lesson ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LessonModal;