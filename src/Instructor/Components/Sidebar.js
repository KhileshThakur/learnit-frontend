import  { 
  LayoutDashboard, 
  CalendarCheck, 
  Calendar, 
  BookOpen, 
  Upload, 
  Brain, 
  MessageSquare, 
  FileBox, 
  Package, 
  LogOut,
  Plus,
  Settings
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../Auth/AuthContext';

const Sidebar = ({ onMenuSelect, activeMenu = 'Dashboard' }) => {
  const { logout } = useContext(AuthContext);
  
  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Courses', icon: <BookOpen size={18} /> },
    { label: 'Create Course', icon: <Plus size={18} /> },
    { label: 'Meeting Requests', icon: <CalendarCheck size={18} /> },
    { label: 'Scheduled Meeting', icon: <Calendar size={18} /> },
    { label: 'Upload Course', icon: <Upload size={18} /> },
    { label: 'LearnAI', icon: <Brain size={18} /> },
    { label: 'Discussion Forum', icon: <MessageSquare size={18} /> },
    { label: 'Create Capsule', icon: <FileBox size={18} /> },
    { label: 'My Capsule', icon: <Package size={18} /> },
    { label: 'Settings', icon: <Settings size={18} /> },
    { label: 'Logout', icon: <LogOut size={18} /> }
  ];

  const handleMenuClick = (menuLabel) => {
    if (menuLabel === 'Logout') {
      logout();
      return;
    }
    
    if (onMenuSelect) {
      onMenuSelect(menuLabel);
    }
  };

  return (
    <div className="w-64 bg-gray-900 min-h-full border-r border-gray-800 p-4">
      <div className="mb-8 mt-2 flex items-center">
        <div className="text-purple-500 text-2xl font-bold flex items-center">
          <span className="border-2 border-purple-500 p-1">L</span>
          <span className="ml-2">LearnIT</span>
        </div>
        <span className="text-xs text-gray-400 ml-2">since 2020</span>
      </div>
      
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.label} className="mb-2">
              <button 
                className={`w-full text-left py-2 px-4 rounded flex items-center hover:bg-purple-900 transition-all ${
                  activeMenu === item.label ? 'bg-purple-700' : ''
                }`}
                onClick={() => handleMenuClick(item.label)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
 