import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

//Import Components
import Homepage from './Home/Pages/Homepage';
import Login from './Auth/Authentication';
import JoinAsLearner from './Auth/JoinAsLearner';
import JoinAsInstructor from './Auth/JoinAsInstructor';
import InsDashboard from './Instructor/InsDashboard';
import LeaApp from './Learner/Pages/LeaApp';

import AdminAuth from './Admin/Pages/AdminAuth';
import AdminDashboard from './Admin/Pages/AdminDashboard';



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
        {/* learner routes  */}
        <Route path="/learner/:id/dashboard" element={<LeaApp/>} />
        {/* instructor routes */}
        <Route path="/instructor/:id/dashboard" element={<InsDashboard/>} />
        
      </Routes>
    </Router>
  );
}

export default App;
