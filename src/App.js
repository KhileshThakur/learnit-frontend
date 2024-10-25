import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

//Import Components
import Homepage from './Home/Pages/Homepage';
import Login from './Auth/Login';
<<<<<<< HEAD
import RegisterLearner from './Auth/RegisterLearner';
import RegisterInstructor from './Auth/RegisterInstructor';
import AdminAuth from './Admin/Pages/AdminAuth';
import AdminDashboard from './Admin/Pages/AdminDashboard';
=======
// import Authenticate from './Auth/Components/Authenticate';
import JoinAsLearner from './Auth/Components/JoinAsLearner';
import JoinAsInstructor from './Auth/Components/JoinAsInstructor';
>>>>>>> 52011601335069d2981171613b01105540d42657



function App() {
  return (
    <Router>
      <Routes>
        {/* auth and register routes  */}
        <Route path="/" element={<Homepage/>} />
        <Route path="/auth" element={<Login/>} />
<<<<<<< HEAD
        <Route path="/register-learner" element={<RegisterLearner/>} />
        <Route path="/register-instructor" element={<RegisterInstructor/>} />
        {/* admin routes  */}
        <Route path="/admin/auth" element={<AdminAuth/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} /> {/*Need Authentification */}
=======
        <Route path="/register-learner" element={<JoinAsLearner/>} />
        <Route path="/register-instructor" element={<JoinAsInstructor/>} />
>>>>>>> 52011601335069d2981171613b01105540d42657
      </Routes>
    </Router>
  );
}

export default App;
