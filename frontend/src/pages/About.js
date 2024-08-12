import Header from '../components/Header';

function About() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col"> 
      <Header />

      <main className="container mx-auto py-12 flex-grow"> 
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">О нас</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-md shadow-md">
            <h3 className="text-2xl font-bold mb-4">Наша миссия</h3>
            <p className="text-gray-600">Наша миссия - сделать изучение языков всех народов России и стан СНГ доступным и интересным. Мы предлагаем широкий выбор курсов, которые помогут сохранить и распространитить знания и диалекты языков.</p>
          </div>
          <div className="p-6 bg-white rounded-md shadow-md">
            <h3 className="text-2xl font-bold mb-4">Наша команда</h3>
            <p className="text-gray-600">В нашей команде работают начинающие программисты и мы будем рады помощи от лингвистов или просто представителей различных народов в составлении курсов.</p>
          </div>
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

export default About;

