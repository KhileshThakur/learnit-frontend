import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import { FaQuoteRight } from "react-icons/fa";


// components 
import Header from '../../Utility/Components/Header'
import Footer from '../../Utility/Components/Footer'
import HomeImage from '../../Utility/Images/HomeImage.png'
import FeedbackModal from '../../Utility/Components/FeedbackModal';

//css & icons
import './Homepage.css'
import { BsPersonWorkspace } from "react-icons/bs";
import { MdOndemandVideo } from "react-icons/md";
import { GoCommentDiscussion } from "react-icons/go";
import { PiSparkle } from "react-icons/pi";
import { CgSandClock } from "react-icons/cg";


const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [colors, setColors] = useState({
    main: '#5E4592',
    prev: '#4396C5',
    next: '#4396C5',
  });
  const [animate, setAnimate] = useState(false); // State for animation

  const slideData = [
    {
      id: 1,
      message: "This app is incredibly useful, enhancing productivity and streamlining tasks for users in their everyday activities effectively.",
      author: "John Doe",
    },
    {
      id: 2,
      message: "I love using this app! It makes my daily routine so much easier and helps me stay organized effortlessly.",
      author: "Jane Smith",
    },
    {
      id: 3,
      message: "Fantastic features make this app stand out. It's user-friendly and provides everything I need to get work done.",
      author: "Alice Johnson",
    },
    {
      id: 4,
      message: "Great user experience overall! The interface is intuitive, and navigating through its features feels smooth and enjoyable.",
      author: "Bob Brown",
    },
    {
      id: 5,
      message: "Highly recommend it! This app has transformed the way I manage my tasks, and it always exceeds my expectations.",
      author: "Charlie White",
    },
    {
      id: 6,
      message: "A must-have app for anyone looking to enhance their productivity. It has become an essential tool in my life.",
      author: "Eve Davis",
    },
  ];


  const handlePrevSlide = () => {
    setAnimate(true); // Trigger animation
    setCurrentSlide((prev) => {
      const newSlide = (prev === 0 ? slideData.length - 1 : prev - 1);
      setColors({
        main: '#5E4592',
        prev: '#4396C5',
        next: '#4396C5',
      });
      return newSlide;
    });
  };

  const handleNextSlide = () => {
    setAnimate(true); // Trigger animation
    setCurrentSlide((prev) => {
      const newSlide = (prev === slideData.length - 1 ? 0 : prev + 1);
      setColors({
        main: '#5E4592',
        prev: '#4396C5',
        next: '#4396C5',
      });
      return newSlide;
    });
  };

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimate(false); // Reset animation after a short delay
      }, 500); // Match the duration with the transition time in CSS

      return () => clearTimeout(timer); // Cleanup on unmount or effect change
    }
  }, [animate]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFeedbackSubmit = (feedback) => {
    console.log('Feedback submitted:', feedback);
    // You can handle the feedback submission logic here, like sending it to an API.
  };

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
        <Link to="/auth" className="go-button">
          GO <span className="arrow">→</span>
        </Link>
      </div>

      <div className="image">
        <img src={HomeImage} alt="HomepageImg" />
      </div>

      <hr className="hr-below-img" />

      <h4 className="feature-heading">FEATURES WE PROVIDE</h4>

      <div className="features">
        <div className="box1">
          <BsPersonWorkspace />
          <p>Personalized One-to-One Sessions with Expert Educators</p>
          <hr className="box-hr" />
        </div>
        <div className="box2">
          <MdOndemandVideo />
          <p>Transform Your Expertise into Courses for Learners</p>
          <hr className="box-hr" />
        </div>
        <div className="box3">
          <GoCommentDiscussion />
          <p>Interactive Discussion Forums for Collaborative Learning</p>
          <hr className="box-hr" />
        </div>
        <div className="box4">
          <PiSparkle />
          <p>AI-Powered Doubt Resolution through Chatbot Assistance</p>
          <hr className="box-hr" />
        </div>
        <div className="box5">
          <CgSandClock />
          <p>Time Capsules for  Efficient Study Management</p>
          <hr className="box-hr" />
        </div>
      </div>

      <h1 className="quote">
        <span className="quote-left">“</span> Learn to Grow, Teach to Inspire <span className="quote-right">”</span>
      </h1>

      <p className="small-quote">Start your journey with LearnIT</p>

      <div className="join-buttons">
        <button className="join-btn">Join as Learner</button>
        <button className="join-btn">Join as Instructor</button>
      </div>
      <hr className="hr-below-img" />
      <h4 className="feature-heading">FEEDBACK SECTION</h4>


      <section className="slider">
        <div id="prev-slide" onClick={handlePrevSlide} style={{ background: colors.prev }}>
          Prev
        </div>
        <div className={`main-slide ${animate ? 'animate' : ''}`} style={{ background: colors.main }}>
          <div className="feedback-quote"><FaQuoteRight /></div>
          <h3 className="message">
            {slideData[currentSlide].message}
          </h3>
          <p className="author">
            - {slideData[currentSlide].author}
          </p>
        </div>
        <div id="next-slide" onClick={handleNextSlide} style={{ background: colors.next }}>
          Next
        </div>
      </section>
      <div className="feedback-form-button">
        <button className="join-btn" onClick={() => setIsModalOpen(true)}>
          Fill Feedback Form
        </button>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    

    <Footer />
    </div>
  )
}

export default Homepage
