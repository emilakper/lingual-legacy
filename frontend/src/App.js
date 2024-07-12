import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Функция для получения данных с бэкенда
    const fetchData = async () => {
      try {
        const response = await fetch('/api/hello');
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
        setMessage('Ошибка при загрузке данных');
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Lingua Legacy</h1>
      <p>{message}</p> 
    </div>
  );
}

export default App;
