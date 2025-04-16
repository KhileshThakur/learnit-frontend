// src/components/Loader.js
import React from 'react';
import './Loader.css'; // Import the CSS file for styles

const Loader = () => {
    return (
        <div className="loader-wrapper">
            <div className="loader">
                <div className="l-shape left"></div>
                <div className="l-shape right"></div>
            </div>
        </div>
    );
};

export default Loader;
