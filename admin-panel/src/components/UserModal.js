import React, { useEffect, useState } from 'react';

function UserModal({ isOpen, onClose, user, onSave, onDelete }) {
  const [email, setEmail] = useState(user ? user.email : '');
  const [password, setPassword] = useState(''); 
  const [isAdmin, setIsAdmin] = useState(user ? user.is_admin : false);

  const handleSave = () => {
    onSave({ email, password, isAdmin }); 
    onClose(); 
  };

  const handleDelete = () => {
    onDelete(user.id); 
    onClose(); 
  };

  useEffect(() => {
    if (user){
        setEmail(user.email)
        setIsAdmin(user.is_admin)
    } else {
        setEmail('')
        setPassword('')
        setIsAdmin(false)
    }
  }, [user])


  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'} bg-gray-500 bg-opacity-50`}> 
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {user ? 'Редактировать пользователя' : 'Создать пользователя'}
        </h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label htmlFor="isAdmin" className="block text-gray-700 font-bold mb-2">Администратор</label>
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Отмена
            </button>
            {user && (
              <button type="button" onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
                Удалить
              </button>
            )}
            <button type="button" onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2">
              {user ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;