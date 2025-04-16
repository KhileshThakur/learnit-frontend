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
import LDashboard from './Learner/Components/LDashboard';
import IDashboard from './Instructor/Components/IDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth and Register Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/auth" element={<Login />} />
          <Route path="/register-learner" element={<JoinAsLearner />} />
          <Route path="/register-instructor" element={<JoinAsInstructor />} />
          {/* Admin Routes */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/learner/:id/dashboard" element={<LDashboard />} />
            <Route path="/instructor/:id/dashboard" element={<IDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
