import  { createContext, useState } from 'react';

export const CourseContext = createContext({
  courses: [],
  addCourse: () => {},
  updateCourse: () => {},
  deleteCourse: () => {},
});

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([
    {
      id: '1',
      title: 'Introduction to Artificial Intelligence',
      description: 'Learn the basics of AI and machine learning in this comprehensive course.',
      category: 'Computer Science',
      level: 'Beginner',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1595617795501-9661aafda72a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '6 weeks',
      lessons: 24,
      published: true,
      createdAt: '2023-05-15',
      students: 128,
      rating: 4.7,
      curriculum: [
        { 
          section: 'Introduction to AI', 
          lessons: [
            { title: 'What is AI?', duration: '15:00' },
            { title: 'History of AI', duration: '20:00' },
          ]
        },
        { 
          section: 'Machine Learning Basics', 
          lessons: [
            { title: 'Supervised Learning', duration: '25:00' },
            { title: 'Unsupervised Learning', duration: '20:00' },
          ]
        }
      ]
    },
    {
      id: '2',
      title: 'Advanced Quantum Computing',
      description: 'Dive deep into quantum computing concepts and applications.',
      category: 'Physics',
      level: 'Advanced',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      duration: '8 weeks',
      lessons: 32,
      published: true,
      createdAt: '2023-06-10',
      students: 64,
      rating: 4.9,
      curriculum: [
        { 
          section: 'Quantum Mechanics Review', 
          lessons: [
            { title: 'Wave Functions', duration: '30:00' },
            { title: 'Quantum States', duration: '25:00' },
          ]
        },
        { 
          section: 'Quantum Algorithms', 
          lessons: [
            { title: 'Shor\'s Algorithm', duration: '45:00' },
            { title: 'Grover\'s Algorithm', duration: '35:00' },
          ]
        }
      ]
    }
  ]);

  const addCourse = (course) => {
    const newCourse = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      students: 0,
      rating: 0,
      published: false
    };
    setCourses([...courses, newCourse]);
    return newCourse;
  };

  const updateCourse = (updatedCourse) => {
    setCourses(
      courses.map((course) => 
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };

  const deleteCourse = (courseId) => {
    setCourses(courses.filter((course) => course.id !== courseId));
  };

  return (
    <CourseContext.Provider value={{ courses, addCourse, updateCourse, deleteCourse }}>
      {children}
    </CourseContext.Provider>
  );
};
 