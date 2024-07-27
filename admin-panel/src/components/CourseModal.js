import React, { useEffect, useState } from 'react';

function CourseModal({ isOpen, onClose, course, onSave, onDelete }) {
  const [title, setTitle] = useState(course ? course.title : '');
  const [description, setDescription] = useState(course ? course.description : '');

  const handleSave = () => {
    onSave({ title, description }); 
    onClose(); 
  };

  const handleDelete = () => {
    onDelete(course.id);
    onClose(); 
  };

  useEffect(() => {
    if (course){
        setTitle(course.title);
        setDescription(course.description);
    } else {
        setTitle('');
        setDescription('');
    }
  }, [course]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'} bg-gray-500 bg-opacity-50`}> 
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {course ? 'Редактировать курс' : 'Создать курс'}
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
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Описание</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Отмена
            </button>
            {course && (
              <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
                Удалить
              </button>
            )}
            <button type="button" onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2">
              {course ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CourseModal;