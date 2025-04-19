import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import VideoContainer from './VideoContainer';
import Chat from './Chat';
import './VideoConference.css';

const VideoConference = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // Get user info - can be modified to work with your auth system
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');
  const backendurl = process.env.REACT_APP_BACKEND;
  const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  
  const [peers, setPeers] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  
  // Fetch class details
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await fetch(`${backendurl}/classes/classes/${classId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch class details');
        }
        const data = await response.json();
        setClassDetails(data.class);
      } catch (error) {
        console.error('Error fetching class details:', error);
        setErrorMessage('Failed to load class information');
      }
    };
    
    fetchClassDetails();
  }, [classId, backendurl, token]);
  
  // Initialize WebRTC and socket connection
  useEffect(() => {
    if (!classDetails && !(currentUser && currentUser.role === 'instructor')) {
      console.log('Waiting for class details before initializing WebRTC...');
      return; // Only wait for class details for non-instructors
    }
    
    // Add class to body when component mounts
    document.body.classList.add('video-conference-active');
    
    console.log('Initializing WebRTC connection...');
    
    // Add beforeunload event listener to prevent accidental navigation
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the meeting?';
      return 'Are you sure you want to leave the meeting?';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    try {
      // Client-side connection diagnostics
      console.log('SOCKET CONNECTION DIAGNOSTICS:');
      console.log('- API URL:', backendurl);
      console.log('- Socket URL:', socketUrl);
      console.log('- Class ID:', classId);
      console.log('- User:', currentUser?.name || 'Unknown', '(', currentUser?.role || 'Unknown role', ')');
      
      // Create connection to signaling server - using default namespace
      socketRef.current = io(socketUrl, {
        path: '/socket.io',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true,
        forceNew: true,
        transports: ['websocket', 'polling'],
        auth: {
          token: token
        }
      });
      
      const socket = socketRef.current;
      
      if (!socket) {
        throw new Error('Failed to initialize socket connection');
      }
      
      // Connection error handling
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        console.error('Socket connection error details:', {
          message: err.message,
          description: err.description,
          type: err.type,
          error: err
        });
        
        setErrorMessage(`Socket connection error: ${err.message}. Video conference features will be limited.`);
        
        // Enable mock mode with limited functionality
        setIsConnected(true);
        setPeers([
          { userId: 'mock-1', userName: 'Demo User 1' },
          { userId: 'mock-2', userName: 'Demo User 2' }
        ]);
      });
      
      // Connection timeout handling
      socket.on('connect_timeout', () => {
        console.error('Socket connection timeout');
        setErrorMessage('Socket connection timeout. Video conference features will be limited.');
      });
      
      // Successful connection
      socket.on('connect', () => {
        console.log('Connected to signaling server successfully with socket ID:', socket.id);
        setErrorMessage('');
      });
      
      // Connection acknowledgment from server
      socket.on('connection_ack', (data) => {
        console.log('Connection acknowledged by server:', data);
        setErrorMessage('');
      });
      
      // Room join acknowledgment
      socket.on('joinRoom_ack', (data) => {
        console.log('Joined room acknowledged by server:', data);
      });
      
      // Get existing users in the room
      socket.on('existingUsers', (users) => {
        console.log('Existing users in room:', users);
        if (users && users.length > 0) {
          setPeers(users);
          users.forEach(user => {
            if (user.userId) {
              createPeerConnection(user.userId);
            }
          });
        }
      });
      
      // Get local media
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          // Only join room if socket is connected
          if (socket.connected) {
            // Join room
            socket.emit('joinRoom', {
              roomId: classId,
              userId: currentUser?.id || 'anonymous',
              userName: currentUser?.name || currentUser?.email || 'Anonymous User'
            });
          }
          
          setIsConnected(true);
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error);
          setErrorMessage('Failed to access camera or microphone. ' + (error?.message || ''));
        });
        
      // Socket event handlers
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setErrorMessage(error?.message || 'Socket connection error');
      });
      
      socket.on('userJoined', (user) => {
        if (!user) return;
        console.log('User joined:', user);
        setPeers(prevPeers => [...prevPeers, user]);
        
        // Create peer connection for the new user
        if (user.userId) {
          createPeerConnection(user.userId);
        }
      });
      
      socket.on('userLeft', (userId) => {
        console.log('User left:', userId);
        setPeers(prevPeers => prevPeers.filter(peer => peer.userId !== userId));
        
        // Close and remove the peer connection
        if (peerConnectionsRef.current[userId]) {
          peerConnectionsRef.current[userId].close();
          delete peerConnectionsRef.current[userId];
        }
      });
      
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('iceCandidate', handleIceCandidate);
      
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setErrorMessage('Failed to initialize video conference: ' + (error?.message || 'Unknown error'));
      
      // Enable mock mode with limited functionality when socket fails
      setIsConnected(true);
      setPeers([
        { userId: 'mock-1', userName: 'Demo User 1' },
        { userId: 'mock-2', userName: 'Demo User 2' }
      ]);
    }
    
    // Clean up on component unmount
    return () => {
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      
      // Disconnect socket if it exists
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      // Remove class from body when component unmounts
      document.body.classList.remove('video-conference-active');
      
      // Remove the beforeunload event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [classDetails, classId, currentUser, backendurl, socketUrl, token]);
  
  // Function to create a new peer connection
  const createPeerConnection = (userId) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('iceCandidate', {
            to: userId,
            candidate: event.candidate
          });
        }
      };
      
      // Handle remote tracks
      pc.ontrack = (event) => {
        setPeers(prevPeers => 
          prevPeers.map(peer => {
            if (peer.userId === userId) {
              return { ...peer, stream: event.streams[0] };
            }
            return peer;
          })
        );
      };
      
      // Create an offer if we're the initiator
      if (currentUser && (currentUser.role === 'instructor' || 
          (currentUser.role === 'learner' && peers.some(p => p.role === 'instructor')))) {
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => {
            socketRef.current.emit('offer', {
              to: userId,
              offer: pc.localDescription
            });
          })
          .catch(error => {
            console.error('Error creating offer:', error);
          });
      }
      
      peerConnectionsRef.current[userId] = pc;
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  };
  
  // Handle incoming offer
  const handleOffer = async ({ from, offer }) => {
    if (!from || !offer) return;

    try {
      // Create peer connection if it doesn't exist
      let pc = peerConnectionsRef.current[from];
      if (!pc) {
        pc = createPeerConnection(from);
        if (!pc) return; // Exit if we couldn't create the peer connection
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socketRef.current.emit('answer', {
        to: from,
        answer: pc.localDescription
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };
  
  // Handle incoming answer
  const handleAnswer = ({ from, answer }) => {
    if (!from || !answer) return;
    
    try {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };
  
  // Handle incoming ICE candidate
  const handleIceCandidate = ({ from, candidate }) => {
    if (!from || !candidate) return;
    
    try {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };
  
  // Toggle microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };
  
  // Toggle camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        screenStreamRef.current = screenStream;
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const senders = pc.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          if (videoSender) {
            videoSender.replaceTrack(videoTrack);
          }
        });
        
        // Show screen share in local video
        if (localVideoRef.current) {
          const newStream = new MediaStream([
            videoTrack,
            ...localStreamRef.current.getAudioTracks()
          ]);
          localVideoRef.current.srcObject = newStream;
        }
        
        // Handle end of screen sharing
        videoTrack.onended = stopScreenSharing;
        
        setIsScreenSharing(true);
      } else {
        stopScreenSharing();
      }
    } catch (error) {
      console.error('Error with screen sharing:', error);
    }
  };
  
  // Stop screen sharing
  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      
      // Restore original video track
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          Object.values(peerConnectionsRef.current).forEach(pc => {
            const senders = pc.getSenders();
            const videoSender = senders.find(sender => 
              sender.track && sender.track.kind === 'video'
            );
            if (videoSender) {
              videoSender.replaceTrack(videoTrack);
            }
          });
          
          // Restore local video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        }
      }
      
      screenStreamRef.current = null;
      setIsScreenSharing(false);
    }
  };
  
  // Leave the meeting with confirmation
  const leaveMeeting = () => {
    // Ensure all media tracks are stopped before navigating
    if (localStreamRef.current) {
      console.log('Stopping local media tracks');
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      console.log('Stopping screen sharing tracks');
      screenStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      screenStreamRef.current = null;
    }
    
    // Disconnect socket
    if (socketRef.current) {
      console.log('Disconnecting socket');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => {
      try {
        pc.close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      }
    });
    peerConnectionsRef.current = {};
    
    // Check user role and ID for correct navigation
    const role = currentUser?.role?.toLowerCase() || '';
    const userId = currentUser?.id;
    console.log('User role for navigation:', role);
    console.log('User ID for navigation:', userId);
    
    // Navigate based on role and user ID
    if (role === 'instructor' && userId) {
      console.log('Redirecting to instructor dashboard');
      navigate(`/instructor/${userId}/dashboard`);
    } else if (role === 'learner' && userId) {
      console.log('Redirecting to learner dashboard');
      navigate(`/learner/${userId}/dashboard`);
    } else {
      console.log('Fallback: Redirecting to home');
      navigate('/');
    }
  };
  
  // Toggle chat
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  // Add a cleanup effect that runs on component unmount
  useEffect(() => {
    // This effect only handles the cleanup when component unmounts
    return () => {
      console.log('Component unmounting - cleaning up resources');
      
      // Stop all media tracks if they're still active
      if (localStreamRef.current) {
        console.log('Stopping local tracks on unmount');
        localStreamRef.current.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            console.log(`Stopping ${track.kind} track`);
            track.stop();
          }
        });
      }
      
      // Stop screen sharing if active
      if (screenStreamRef.current) {
        console.log('Stopping screen sharing on unmount');
        screenStreamRef.current.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      }
      
      // Ensure socket is disconnected
      if (socketRef.current && socketRef.current.connected) {
        console.log('Disconnecting socket on unmount');
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array ensures this only runs on unmount
  
  return (
    <div className="video-conference">
      {/* Header */}
      <header className="conference-header">
        <div className="header-title">
          <div className="header-logo"></div>
          <h1>LearnIt Live Class</h1>
        </div>
        <div className="header-info">
          <span className="participant-count">
            {peers.length + 1} participants
          </span>
          <span className="room-id">Class: {classDetails?.title || classId}</span>
        </div>
      </header>

      {/* Error message */}
      {errorMessage && (
        <div className="error-message">
          Error: {errorMessage}
        </div>
      )}

      {/* Main content */}
      <div className="conference-content">
        <main className="video-grid" 
              style={{ 
                gridTemplateColumns: peers.length > 0
                  ? peers.length === 1 
                    ? 'repeat(2, 1fr)'
                    : peers.length <= 3 
                      ? 'repeat(2, 1fr)' 
                      : 'repeat(3, 1fr)'
                  : '1fr'
              }}>
          {/* Local video */}
          <VideoContainer name={`${currentUser && currentUser.name || 'You'} (You)`} isSelf={true}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={isCameraOn ? '' : 'hidden'}
            />
            {!isCameraOn && (
              <div className="avatar-placeholder">
                <div className="avatar-circle">
                  {currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'Y'}
                </div>
              </div>
            )}
            <div className="status-indicator">
              {!isMicOn && <div className="mic-off-indicator"></div>}
              {!isCameraOn && <div className="camera-off-indicator"></div>}
            </div>
          </VideoContainer>
          
          {/* Remote videos */}
          {peers.map((peer) => (
            <VideoContainer key={peer.userId} name={peer.userName}>
              {/* If real peer with stream, show video */}
              {peer.stream ? (
                <video
                  autoPlay
                  playsInline
                  ref={(element) => {
                    if (element && peer.stream) {
                      element.srcObject = peer.stream;
                    }
                  }}
                />
              ) : (
                /* For mock users or users without streams, show avatar placeholder */
                <div className="avatar-placeholder">
                  <div className="avatar-circle">
                    {peer.userName ? peer.userName.charAt(0).toUpperCase() : '?'}
                  </div>
                  {peer.userId.startsWith('mock') && (
                    <div className="mock-label">Simulated User</div>
                  )}
                </div>
              )}
            </VideoContainer>
          ))}
        </main>
        
        {/* Chat sidebar */}
        {isChatOpen && (
          <aside className="chat-sidebar">
            <Chat 
              roomId={classId} 
              userName={currentUser && (currentUser.name || currentUser.email) || 'User'} 
              socket={socketRef.current}
              onClose={toggleChat} 
            />
          </aside>
        )}
      </div>

      {/* Controls */}
      <footer className="conference-controls">
        <button
          onClick={toggleMic}
          className={`control-btn ${!isMicOn ? 'control-btn-off' : ''}`}
          title={isMicOn ? "Mute microphone" : "Unmute microphone"}
        >
          <div className={`mic-icon ${!isMicOn ? 'off' : ''}`}></div>
        </button>

        <button
          onClick={toggleCamera}
          className={`control-btn ${!isCameraOn ? 'control-btn-off' : ''}`}
          title={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          <div className={`camera-icon ${!isCameraOn ? 'off' : ''}`}></div>
        </button>
        
        <button
          onClick={toggleScreenShare}
          className={`control-btn ${isScreenSharing ? 'control-btn-active' : ''}`}
          title={isScreenSharing ? "Stop sharing screen" : "Share your screen"}
        >
          <div className="screen-share-icon"></div>
        </button>
        
        <button
          onClick={toggleChat}
          className={`control-btn ${isChatOpen ? 'control-btn-active' : ''}`}
          title="Toggle chat"
        >
          <div className="chat-icon"></div>
        </button>

        <button
          onClick={leaveMeeting}
          className="leave-btn"
          title="Leave meeting"
        >
          <div className="leave-icon"></div>
          Leave
        </button>
      </footer>
    </div>
  );
};

export default VideoConference;
