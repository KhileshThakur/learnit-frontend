import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../Auth/AuthContext';
import Sidebar from './Sidebar';
import ProfileSection from './ProfileSection';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateCourse from '../Courses/CreateCourse'
import MyCourses from '../Courses/MyCourses'

const IDashboard = () => {
  const { userId, userRole } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  useEffect(() => {
    const fetchInstructorData = async () => {
      if (!userId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/instructor/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch instructor data');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        toast.error('Failed to load instructor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [userId]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'My Courses':
        return <MyCourses />;
      case 'Create Course':
        return <CreateCourse />;
      default:
        return (
          <>
            <h1 className="text-3xl font-bold mb-8">Welcome Back, {profileData?.name}</h1>
            <ProfileSection 
              initialData={profileData}
              onProfileUpdate={(updatedData) => setProfileData(updatedData)}
            />
            {/* <AnalyticsSection /> */}
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      <Sidebar onMenuSelect={setActiveMenu} activeMenu={activeMenu} />
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default IDashboard;
 