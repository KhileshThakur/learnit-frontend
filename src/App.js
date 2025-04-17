import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthProvider from './Auth/AuthContext'; // Import AuthProvider


// Import Components
import Homepage from './Home/Pages/Homepage';
import Login from './Auth/Authentication';
import JoinAsLearner from './Auth/JoinAsLearner';
import JoinAsInstructor from './Auth/JoinAsInstructor';
// import InsApp from './Instructor/Pages/InsApp';
import AdminAuth from './Admin/Pages/AdminAuth';
import AdminDashboard from './Admin/Pages/AdminDashboard';
import ProtectedRoute from './Utility/Components/ProtectedRoute';

function App() {
  return (
    <Router>

      <Routes>
        {/* auth and register routes  */}
        <Route path="/" element={<Homepage />} />
        <Route path="/auth" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register-learner" element={<JoinAsLearner />} />
        <Route path="/register-instructor" element={<JoinAsInstructor />} />
        {/* admin routes  */}
        <Route path="/admin/auth" element={<AdminAuth />} />


        {/* ProtectedRoutes  */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />} >
          {/* admin routes  */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/*wrong need to change */}
          {/* learner routes  */}
          <Route path="/learner/:id/dashboard" element={<LeaApp />} />
          {/* instructor routes */}
          <Route path="/instructor/:id/dashboard" element={<InsApp />} />
          
        </Route>
      </Routes>

    </Router>
  );
}

export default App;
