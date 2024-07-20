import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CourseList from './pages/CourseList'; 
import Login from './pages/Login';  
import Register from './pages/Register';  
import Course from './pages/Course';  
import About from './pages/About';
import Contacts from './pages/Contacts';

function App() {
  return (
    <Router> 
      <div>
        <Routes> 
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} /> 
          <Route path="/courses/:id" element={<Course />} /> 
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
