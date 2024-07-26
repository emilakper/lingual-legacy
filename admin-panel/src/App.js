import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminHome from './pages/AdminHome';
import AdminUsers from './pages/AdminUsers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <Router> 
      <div>
        <Routes> 
          <Route path="/" element={<AdminHome />} />
          <Route path="/login" element={<AdminLogin />} /> 
          <Route path="/admin/users" element={<AdminUsers />} /> 
        </Routes>
        <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      </div>
    </Router>
  );
}

export default App;

