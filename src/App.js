import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

//Import Components
import Homepage from './Home/Pages/Homepage';
import Login from './Auth/Login';
import AdminAuth from './Admin/Pages/AdminAuth';
import AdminDashboard from './Admin/Pages/AdminDashboard';
// import Authenticate from './Auth/Components/Authenticate';
import JoinAsLearner from './Auth/Components/JoinAsLearner';
import JoinAsInstructor from './Auth/Components/JoinAsInstructor';



function App() {
  return (
    <Router>
      <Routes>
        {/* auth and register routes  */}
        <Route path="/" element={<Homepage/>} />
        <Route path="/auth" element={<Login/>} />
        <Route path="/register-learner" element={<JoinAsLearner/>} />
        <Route path="/register-instructor" element={<JoinAsInstructor/>} />
        {/* admin routes  */}
        <Route path="/admin/auth" element={<AdminAuth/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} /> {/*Need Authentification */}
        
      </Routes>
    </Router>
  );
}

export default App;
