import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

//Import Components
import Homepage from './Home/Pages/Homepage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage/>} />
      </Routes>
    </Router>
  );
}

export default App;
