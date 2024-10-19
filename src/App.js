import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api`)
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, []);
  
  return (
    <div>

      <h1>{data ? data.message : 'Loading...'}</h1>
      <h2>Hello</h2>

      <h1>{data ? data.message : 'Loading Data...'}</h1>

    </div>
  );
}

export default App;
