import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaQuoteRight } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// components 
import Header from '../../Utility/Components/Header'
import Footer from '../../Utility/Components/Footer'
import HomeImage from '../../Utility/Images/HomeImage.png'
import FeedbackModal from '../Components/FeedbackModal';
import Loader from '../../Utility/Components/UI/Loader';

//css & icons
import './Homepage.css'
import { BsPersonWorkspace } from "react-icons/bs";
import { MdOndemandVideo } from "react-icons/md";
import { GoCommentDiscussion } from "react-icons/go";
import { PiSparkle } from "react-icons/pi";
import { CgSandClock } from "react-icons/cg";


const Homepage = () => {

  const backenduri = process.env.REACT_APP_BACKEND;

  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideData, setSlideData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [colors, setColors] = useState({
    main: '#5E4592',
    prev: '#4396C5',
    next: '#4396C5',
  });


  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${backenduri}/feedbacks`);
        if (!response.ok) {
          throw new Error('Failed to fetch feedbacks.');
        }
        const data = await response.json();
        setSlideData(data.feedbacks);
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      } catch (err) {
        console.error(err.message);
      }
      finally{
        setLoading(false);
      }
      
    };
    fetchFeedbacks();
  }, [backenduri]);

  const handlePrevSlide = () => {
    setAnimate(true);
    setCurrentSlide((prev) => (prev === 0 ? slideData.length - 1 : prev - 1));
    setColors({
      main: '#5E4592',
      prev: '#4396C5',
      next: '#4396C5',
    });
  };

  const handleNextSlide = () => {
    setAnimate(true);
    setCurrentSlide((prev) => (prev === slideData.length - 1 ? 0 : prev + 1));
    setColors({
      main: '#5E4592',
      prev: '#4396C5',
      next: '#4396C5',
    });
  };

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [animate]);


  const handleFeedbackSubmit = async (feedback) => {
    try {
      const response = await fetch(`${backenduri}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback.');
      }

      const data = await response.json();
      setSlideData((prevData) => [...prevData, data.feedback]);
      setIsModalOpen(false);
      toast.success("Thank You For Feedback!");
    } catch (err) {
      console.error(err.message);
      toast.error("Something Went Wrong, Try Again");
    }
  };

  if (loading) {
    return <Loader />;
  }

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

        {slideData.length > 0 ? (
          <div className={`main-slide ${animate ? 'animate' : ''}`} style={{ background: colors.main }}>
            <div className="feedback-quote"><FaQuoteRight /></div>
            <h3 className="message">
              {slideData[currentSlide]?.message}
            </h3>
            <p className="author">
              - {slideData[currentSlide]?.author}
            </p>
          </div>
        ) : (
          <div className="main-slide">
            <p>Loading feedback...</p>
          </div>
        )}

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
      <ToastContainer />


      <Footer />

    </div>

  )
}

export default Homepage
