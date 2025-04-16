import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../Auth/AuthContext';
import { Edit, Facebook, Linkedin, Twitter } from 'lucide-react';
import { toast } from 'react-toastify';

const ProfileSection = ({ initialData, onProfileUpdate }) => {
  const { userId, userRole } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    qualifications: [],
    availableTime: '',
    experience: '',
    expertise: [],
    bio: '',
    avatar: '' // Add a default avatar URL here
  });
  const [formData, setFormData] = useState({
    name: '',
    qualifications: [],
    availableTime: '',
    experience: '',
    expertise: [],
    bio: '',
    avatar: '' // Add a default avatar URL here
  });

  useEffect(() => {
    if (initialData) {
      setProfileData({
        ...profileData,
        ...initialData,
        qualifications: initialData.qualifications || [],
        expertise: initialData.expertise || []
      });
      setFormData({
        ...profileData,
        ...initialData,
        qualifications: initialData.qualifications || [],
        expertise: initialData.expertise || []
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim())
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profile/${userRole}/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setIsEditing(false);
        onProfileUpdate(updatedData); // Notify parent component of updates
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  if (!profileData) return <div>Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
      <div className="flex flex-col md:flex-row">
        {/* Profile Image Section */}
        <div className="md:w-1/5 mb-6 md:mb-0 flex flex-col items-center">
          <div className="relative">
            <img 
              src={profileData.avatar} 
              alt={profileData.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500" 
            />
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full text-xs">
              <div className="flex items-center text-xs px-1">
                Change Profile
              </div>
            </button>
          </div>
          
          <div className="mt-4 text-center">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-gray-700 text-white rounded px-2 py-1"
              />
            ) : (
              <h2 className="text-xl font-bold text-blue-400">{profileData.name}</h2>
            )}
            <p className="text-gray-400">Hello, {userRole}</p>
          </div>
          
          <div className="flex mt-4 space-x-2">
            <button className="p-2 bg-gray-700 rounded-md text-blue-400">
              <Facebook size={16} />
            </button>
            <button className="p-2 bg-gray-700 rounded-md text-blue-400">
              <Twitter size={16} />
            </button>
            <button className="p-2 bg-gray-700 rounded-md text-blue-400">
              <Linkedin size={16} />
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="md:w-4/5 md:pl-8 border-l border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing ? (
              // Edit Mode
              <>
                <div>
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Qualifications (comma-separated):</h3>
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications.join(', ')}
                      onChange={handleArrayInputChange}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Available Time:</h3>
                    <input
                      type="text"
                      name="availableTime"
                      value={formData.availableTime}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Experience in Teaching:</h3>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Expertise (comma-separated):</h3>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise.join(', ')}
                      onChange={handleArrayInputChange}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-gray-400 mb-1">Bio:</h3>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      rows="4"
                    />
                  </div>
                </div>
              </>
            ) : (
              // View Mode
              <>
                <div>
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Qualification :</h3>
                    <ul>
                      {profileData?.qualifications?.map((qual, index) => (
                        <li key={index} className="text-white">{qual}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Available Time :</h3>
                    <p className="text-white">{profileData.availableTime}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Experience in Teaching :</h3>
                    <p className="text-white">{profileData.experience}</p>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <h3 className="text-gray-400 mb-1">Expertise in :</h3>
                    <p className="text-white">
                      {profileData?.expertise?.join(', ') || 'No expertise listed'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-400 mb-1">Bio :</h3>
                    <p className="text-white text-sm">{profileData.bio}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
