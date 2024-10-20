import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

//Import Components
import Homepage from './Home/Pages/Homepage';
import Login from './Auth/Login';
import RegisterLearner from './Auth/RegisterLearner';
import RegisterInstructor from './Auth/RegisterInstructor';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/auth" element={<Login/>} />
        <Route path="/register-learner" element={<RegisterLearner/>} />
        <Route path="/register-instructor" element={<RegisterInstructor/>} />
      </Routes>
    </Router>
  );
}

export default App;
