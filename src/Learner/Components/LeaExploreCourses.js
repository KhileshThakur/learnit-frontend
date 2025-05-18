import 'react-toastify/dist/ReactToastify.css';
import './LeaExploreCourses.css';

const LeaExploreCourses = ({ learnerId }) => {
  return (
    <div className="explore-courses">
      <h2>Explore Courses</h2>
      <p>Welcome to the course exploration page, Learner {learnerId}!</p>
      {/* Add your course exploration logic here */}
    </div>
  );
};

export default LeaExploreCourses;
