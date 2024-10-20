import React from 'react'

// components 
import Header from '../../Utility/Components/Header'
import Footer from '../../Utility/Components/Footer'
import HomeImage from '../../Utility/Images/HomeImage.png'

//css
import './Homepage.css'

const Homepage = () => {
  return (
    <div className="homepage-conntainer">
      <Header />
      <div className="title">
        <h3 className="title-one">Welcome to <span>LearnIT</span></h3>
        <h2 className="title-two">Learn, Mentor, Succeed</h2>
      </div>
      <div className="role-selector">
        <input
          type="text"
          placeholder="Choose Your Role !!"
          className="role-input"
        />
        <button className="go-button">
          GO <span className="arrow">→</span>
        </button>
      </div>

      <div className="image">
        <img src={HomeImage} alt="HomepageImg" />
      </div>

      <hr className="hr-below-img" />

      <div className="features">
        <div className="box1"></div>
        <div className="box2"></div>
        <div className="box3"></div>
        <div className="box4"></div>
        <div className="box5"></div>
      </div>


      <Footer />
    </div>
  )
}

export default Homepage
