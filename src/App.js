import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { REACT_APP_API_URL } from './Url';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${REACT_APP_API_URL}/api`)
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>{data ? data.message : 'Loading...'}</h1>
    </div>
  );
}

export default App;
