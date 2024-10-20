import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

//Import Components
import Homepage from './Home/Pages/Homepage';
import Login from './Auth/Login';
import RegisterLearner from './Auth/RegisterLearner';
import RegisterInstructor from './Auth/RegisterInstructor';



function App() {
  return (
<<<<<<< HEAD
    <div>

      <h1>{data ? data.message : 'Loading...'}</h1>
      <h2>Hello</h2>

      <h1>{data ? data.message : 'Loading Data...'}</h1>
      <h2>Changes Made By Khilesh Thakur Again Modified</h2>
      <h3>Changes Made in Main</h3>
      <h3>Changes made by Khushi</h3>
    </div>
=======
    <Router>
      <Routes>
        <Route path="/" element={<Homepage/>} />
        <Route path="/auth" element={<Login/>} />
        <Route path="/register-learner" element={<RegisterLearner/>} />
        <Route path="/register-instructor" element={<RegisterInstructor/>} />
      </Routes>
    </Router>
>>>>>>> b096582f85d5bdcffdfda22c41e0c0122f88f315
  );
}

export default App;
