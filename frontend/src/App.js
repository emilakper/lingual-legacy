import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CourseList from './pages/CourseList'; 
import Login from './pages/Login';  
import Register from './pages/Register';  
import Course from './pages/Course';  

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
