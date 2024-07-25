/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#007bff', //  Тёмно-синий  цвет 
        'secondary': '#6c757d', //  Светло-серый  цвет  
      },
    },
  },
  plugins: [],
}

