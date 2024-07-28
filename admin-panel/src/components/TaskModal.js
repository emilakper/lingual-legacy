import React, { useEffect, useState } from 'react';

function TaskModal({ isOpen, onClose, task, onSave, onDelete, lessons }) {
  const [title, setTitle] = useState(task ? task.title : '');
  const [content, setContent] = useState(task ? task.content : '');
  const [lessonId, setLessonId] = useState(task ? task.lesson_id : '');
  const [taskType, setTaskType] = useState(task ? task.task_type : '');
  const [taskOptions, setTaskOptions] = useState(task ? task.task_options || [] : []);
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState(false);

  const handleSave = () => {
    onSave({ title, content, lesson_id: lessonId, task_type: taskType, task_options: taskOptions });
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleAddOption = () => {
    setTaskOptions([...taskOptions, { text: newOptionText, is_correct: newOptionIsCorrect }]);
    setNewOptionText('');
    setNewOptionIsCorrect(false);
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...taskOptions];
    newOptions.splice(index, 1);
    setTaskOptions(newOptions);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...taskOptions];
    newOptions[index][field] = value;
    setTaskOptions(newOptions);
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setContent(task.content);
      setLessonId(task.lesson_id);
      setTaskType(task.task_type);
      setTaskOptions(task.task_options || []);
    } else {
      setTitle('');
      setContent('');
      setLessonId('');
      setTaskType('');
      setTaskOptions([]);
    }
  }, [task]);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
      setLessonId('');
      setTaskType('');
      setTaskOptions([]);
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'} bg-gray-500 bg-opacity-50`}>
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {task ? 'Редактировать задание' : 'Создать задание'}
        </h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="taskType" className="block text-gray-700 font-bold mb-2">Тип задания</label>
            <input
              type="text"
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
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
            <label htmlFor="lessonId" className="block text-gray-700 font-bold mb-2">Урок</label>
            <select
              id="lessonId"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Выберите урок</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Варианты ответов</label>
            {taskOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <button type="button" onClick={() => handleRemoveOption(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Удалить
                </button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <input
                type="checkbox"
                checked={newOptionIsCorrect}
                onChange={(e) => setNewOptionIsCorrect(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <button type="button" onClick={handleAddOption} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Добавить
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Отмена
            </button>
            {task && (
              <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
                Удалить
              </button>
            )}
            <button type="button" onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2">
              {task ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;