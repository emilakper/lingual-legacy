import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminHome from './pages/AdminHome';
import AdminUsers from './pages/AdminUsers';

function App() {

  return (
    <Router> 
      <div>
        <Routes> 
          <Route path="/" element={<AdminHome />} />
          <Route path="/login" element={<AdminLogin />} /> 
          <Route path="/admin/users" element={<AdminUsers />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;

