import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function TaskModal({ isOpen, onClose, task, onSave, onDelete, lessons }) {
  const [taskType, setTaskType] = useState(task ? task.task_type : '');
  const [content, setContent] = useState(task ? task.content : '');
  const [lessonId, setLessonId] = useState(task ? task.lesson_id : '');
  const [options, setOptions] = useState([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [newOptionIsCorrect, setNewOptionIsCorrect] = useState(false);

  useEffect(() => {
    if (task) {
      setTaskType(task.task_type);
      setContent(task.content);
      setLessonId(task.lesson_id);
      fetchTaskOptions(task.id);
    } else {
      setTaskType('');
      setContent('');
      setLessonId('');
      setOptions([]);
    }
  }, [task]);

  const fetchTaskOptions = async (taskId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:8081/admin/task_options?task_id=${taskId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setOptions(response.data.task_options);
    } catch (error) {
      console.error("Ошибка получения вариантов ответов:", error);
    }
  };

  const handleSave = async () => {
    const updatedTask = { 
      task_type: taskType, 
      content, 
      lesson_id: parseInt(lessonId, 10)
    };
    const savedTask = await onSave(updatedTask);
    if (savedTask && savedTask.id) {
      await saveOptions(savedTask.id);
    }
    onClose(); 
  };

  const saveOptions = async (taskId) => {
    const adminToken = localStorage.getItem('adminToken');
    for (const option of options) {
      try {
        await axios.post('http://localhost:8081/admin/task_options', { 
          task_id: parseInt(taskId, 10), 
          text: option.text,
          is_correct: option.is_correct
        }, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
      } catch (error) {
        console.error("Ошибка создания варианта ответа:", error);
        toast.error('Ошибка при создании варианта ответа');
      }
    }
  };

  const handleDelete = () => {
    onDelete(task.id); 
    onClose(); 
  };

  const handleAddOption = () => {
    if (newOptionText.trim()) {
      setOptions([...options, { text: newOptionText, is_correct: newOptionIsCorrect }]);
      setNewOptionText('');
      setNewOptionIsCorrect(false);
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  useEffect(() => {
    if (!isOpen) {
      setTaskType('');
      setContent('');
      setLessonId('');
      setOptions([]);
      setNewOptionText('');
      setNewOptionIsCorrect(false);
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
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index].text = e.target.value;
                    setOptions(newOptions);
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index].is_correct = e.target.checked;
                    setOptions(newOptions);
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <button type="button" onClick={() => handleRemoveOption(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Удалить</button>
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
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <button type="button" onClick={handleAddOption} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Добавить</button>
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