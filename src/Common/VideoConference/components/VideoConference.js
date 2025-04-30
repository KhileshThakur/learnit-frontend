import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { MdScreenShare, MdStopScreenShare, MdExitToApp } from 'react-icons/md';
import { IoMdChatboxes, IoMdChatbubbles } from 'react-icons/io';
import { RiCloseCircleFill } from 'react-icons/ri';
import Chat from './Chat';
import MediasoupClient from '../utils/MediasoupClient';
import './VideoConference.css';

const VideoConference = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // Get user info from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');
  const backendUrl = process.env.REACT_APP_BACKEND || 'http://localhost:5000';
  const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  
  // Log for debugging
  console.log("Using backend URL:", backendUrl);
  console.log("Using socket URL:", socketUrl);
  
  // Component state
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [peers, setPeers] = useState(new Map());
  const [classDetails, setClassDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isInstructor, setIsInstructor] = useState(false);
  
  // Refs
  const mediasoupClientRef = useRef(null);
  const localVideoRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // Initialize media client
  useEffect(() => {
    mediasoupClientRef.current = new MediasoupClient();
    const mediasoupClient = mediasoupClientRef.current;
    
    // Setup callbacks
    mediasoupClient.onConnect = () => {
      console.log('Connected to signaling server');
      setIsConnected(true);
    };
    
    mediasoupClient.onDisconnect = (reason) => {
      console.log('Disconnected from signaling server:', reason);
      setIsConnected(false);
      setErrorMessage(`Disconnected from server: ${reason}`);
    };
    
    mediasoupClient.onUserJoined = (user) => {
      console.log('User joined:', user);
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        newPeers.set(user.peerId, {
          id: user.peerId,
          name: user.peerName,
          role: user.role,
          consumers: []
        });
        return newPeers;
      });
    };
    
    mediasoupClient.onUserLeft = (data) => {
      console.log('User left:', data);
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        newPeers.delete(data.peerId);
        return newPeers;
      });
    };
    
    mediasoupClient.onNewConsumer = (data) => {
      console.log('New consumer:', data);
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        const peer = newPeers.get(data.peerId) || {
          id: data.peerId,
          name: data.peerName,
          consumers: []
        };
        
        // Add consumer to peer
        peer.consumers = [...peer.consumers.filter(c => c.mediaType !== data.mediaType), 
          {
            id: data.consumerId,
            mediaType: data.mediaType,
            track: data.track
          }
        ];
        
        newPeers.set(data.peerId, peer);
        return newPeers;
      });
    };
    
    mediasoupClient.onProducerStateChanged = (data) => {
      console.log('Producer state changed:', data);
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        const peer = newPeers.get(data.peerId);
        
        if (peer) {
          if (data.state === 'closed') {
            // Remove consumer for this media type
            peer.consumers = peer.consumers.filter(c => c.mediaType !== data.mediaType);
          } else {
            // Update consumer state
            peer.consumers = peer.consumers.map(consumer => {
              if (consumer.mediaType === data.mediaType) {
                return {
                  ...consumer,
                  paused: data.state === 'paused'
                };
              }
              return consumer;
            });
          }
          
          newPeers.set(data.peerId, peer);
        }
        
        return newPeers;
      });
    };
    
    mediasoupClient.onChatMessage = (message) => {
      console.log('Chat message received:', message);
      setChatMessages(prevMessages => [...prevMessages, message]);
    };
    
    // Clean up when component unmounts
    return () => {
      if (mediasoupClient) {
        mediasoupClient.disconnect().catch(console.error);
      }
    };
  }, []);
  
  // Fetch class details
  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/classes/classes/${classId}`, {
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
        
        // Set instructor status based on the class data
        if (data.class && data.class.instructor === currentUser.id) {
          setIsInstructor(true);
        }
      } catch (error) {
        console.error('Error fetching class details:', error);
        setErrorMessage('Failed to load class information');
      }
    };
    
    fetchClassDetails();
  }, [classId, backendUrl, token, currentUser.id]);
  
  // Connect to server when component mounts
  useEffect(() => {
    if (mediasoupClientRef.current) {
      // Console log user info
      console.log('=== VIDEO CONFERENCE: USER INFORMATION ===');
      console.log('User ID:', currentUser.id);
      console.log('User Name:', currentUser.name);
      console.log('User Role:', currentUser.role);
      console.log('Is Instructor:', isInstructor);
      console.log('=======================================');
      
      // Explicitly set user information before connecting
      mediasoupClientRef.current.userId = currentUser.id;
      mediasoupClientRef.current.userName = currentUser.name || 'Unknown User';
      mediasoupClientRef.current.userRole = currentUser.role || (isInstructor ? 'instructor' : 'learner');
      
      mediasoupClientRef.current.connect(socketUrl, token, {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role || (isInstructor ? 'instructor' : 'learner')
      })
        .then(() => {
          console.log(`Attempting to join room: ${classId}`);
          return mediasoupClientRef.current.joinRoom(classId, {
            name: currentUser.name,
            role: currentUser.role || (isInstructor ? 'instructor' : 'learner')
          });
        })
        .then(async ({ joined, peers }) => {
          if (joined) {
            console.log(`Successfully joined room: ${classId}`);
            console.log('=== ROOM PARTICIPANTS ===');
            console.log('Number of peers already in room:', peers ? peers.length : 0);
            
            if (peers && peers.length > 0) {
              peers.forEach(peer => {
                console.log(`Peer: ${peer.name} (${peer.id}), Role: ${peer.role || 'unknown'}`);
          });
        }
            console.log('========================');
      
            // Start camera and microphone
            const stream = await mediasoupClientRef.current.startCamera();
            
            // Display local video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          }
        })
        .catch(error => {
          console.error('Error connecting to server:', error);
          setErrorMessage(`Failed to connect: ${error.message}`);
        });
    }
    
    return () => {
      // Cleanup body class
      document.body.classList.remove('video-conference-active');
    };
  }, [classId, socketUrl, token, currentUser.id, currentUser.name, currentUser.role, isInstructor]);
  
  // Attach streams to video elements when peers change
  useEffect(() => {
    // For each peer, attach their streams to video elements
    peers.forEach((peer, peerId) => {
      peer.consumers.forEach(consumer => {
        const videoElement = document.getElementById(`video-${peerId}-${consumer.mediaType}`);
        if (videoElement && consumer.track) {
          // Create a new MediaStream with the consumer track
          const stream = new MediaStream([consumer.track]);
          
          // Only set if not already set with this track
          if (videoElement.srcObject !== stream) {
            videoElement.srcObject = stream;
          }
        }
      });
    });
  }, [peers]);
  
  // Handle toggle microphone
  const toggleMicrophone = async () => {
    try {
      if (mediasoupClientRef.current) {
        await mediasoupClientRef.current.toggleMicrophone(!isMicOn);
        setIsMicOn(!isMicOn);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      setErrorMessage(`Failed to toggle microphone: ${error.message}`);
    }
  };
  
  // Handle toggle camera
  const toggleCamera = async () => {
    try {
      if (mediasoupClientRef.current) {
        await mediasoupClientRef.current.toggleCamera(!isCameraOn);
        setIsCameraOn(!isCameraOn);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      setErrorMessage(`Failed to toggle camera: ${error.message}`);
    }
  };
  
  // Handle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (mediasoupClientRef.current) {
        if (isScreenSharing) {
          await mediasoupClientRef.current.stopScreenSharing();
        } else {
          await mediasoupClientRef.current.startScreenSharing();
        }
        
        setIsScreenSharing(!isScreenSharing);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      
      // Handle permission denied errors gracefully without full screen overlay
      if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
        // Create a temporary message that disappears after a few seconds
        const screenShareError = document.createElement('div');
        screenShareError.className = 'screen-share-error';
        screenShareError.innerHTML = `
          <p>Failed to toggle screen share: Permission denied</p>
          <button>Dismiss</button>
        `;
        
        document.body.appendChild(screenShareError);
        
        // Add click event to dismiss button
        const dismissButton = screenShareError.querySelector('button');
        dismissButton.addEventListener('click', () => {
          document.body.removeChild(screenShareError);
        });
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
          if (document.body.contains(screenShareError)) {
            document.body.removeChild(screenShareError);
          }
        }, 5000);
      } else {
        // For other errors, use the full error overlay
        setErrorMessage(`Failed to toggle screen share: ${error.message}`);
      }
    }
  };
  
  // Handle leaving the meeting
  const leaveMeeting = async () => {
    try {
      if (mediasoupClientRef.current) {
        await mediasoupClientRef.current.disconnect();
      }
      
      // Navigate back to the previous page
      navigate(-1);
    } catch (error) {
      console.error('Error leaving meeting:', error);
      // Force navigate even if error occurs
      navigate(-1);
          }
  };
        
  // Handle ending the meeting for all participants (instructor only)
  const endMeeting = async () => {
    try {
      if (mediasoupClientRef.current) {
        // First end the class in database
        const response = await fetch(`${backendUrl}/classes/classes/${classId}/end`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ instructorId: currentUser.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to end class');
        }

        // Then end the meeting for all participants
        await mediasoupClientRef.current.endMeeting(classId);
        
        // Disconnect and navigate back
        await mediasoupClientRef.current.disconnect();
        navigate(-1);
      }
    } catch (error) {
      console.error('Error ending meeting:', error);
      // Even if ending class fails, try to disconnect and navigate back
      if (mediasoupClientRef.current) {
        await mediasoupClientRef.current.disconnect();
      }
      navigate(-1);
    }
  };
  
  // Handle sending chat message
  const sendChatMessage = (message) => {
    if (mediasoupClientRef.current) {
      // The message will be sent with the current user's information from the socket server
      // Making sure the client is configured with the current user ID
      mediasoupClientRef.current.userId = currentUser.id;
      mediasoupClientRef.current.sendChatMessage(message);
    
      // We don't need to add the message locally as it will come back via the socket
      // with the proper sender information
    }
  };
  
  // Toggle chat sidebar
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  // Render video for a participant
  const renderParticipantVideo = (peer) => {
    const videoConsumer = peer.consumers.find(c => c.mediaType === 'video');
    const screenConsumer = peer.consumers.find(c => c.mediaType === 'screen');
    
    return (
      <div key={peer.id} className="participant-container">
        <div className="participant-video-container">
          {screenConsumer ? (
            <video
              id={`video-${peer.id}-screen`}
              autoPlay
              playsInline
              className="participant-video screen-share"
            />
          ) : (
            <video
              id={`video-${peer.id}-video`}
              autoPlay
              playsInline
              className="participant-video"
            />
          )}
          <div className="participant-info">
            <div className="participant-name">
              {peer.name} {peer.role === 'instructor' && '(Instructor)'}
            </div>
            <div className="participant-controls">
              {!peer.consumers.find(c => c.mediaType === 'audio' && !c.paused) && (
                <FaMicrophoneSlash className="participant-muted-icon" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate optimal grid layout for videos
  const calculateGridLayout = () => {
    const participantCount = peers.size + 1; // +1 for local video
    
    if (participantCount <= 2) {
      return 'grid-cols-1';
    } else if (participantCount <= 4) {
      return 'grid-cols-2';
    } else if (participantCount <= 9) {
      return 'grid-cols-3';
    } else {
      return 'grid-cols-4';
    }
  };
  
  return (
    <div className={`video-conference-container ${isChatOpen ? 'chat-open' : ''}`}>
      {errorMessage && (
        <div className="error-overlay">
        <div className="error-message">
            <p>{errorMessage}</p>
            <button onClick={leaveMeeting}>Leave Meeting</button>
          </div>
        </div>
      )}

      <div className="meeting-info">
        <h2>{classDetails ? classDetails.name : 'Class Meeting'}</h2>
        <div className="participants-count">
          Participants: {peers.size + 1}
        </div>
      </div>
      
      <div className="main-content">
        <div className={`video-grid ${calculateGridLayout()}`} ref={videoContainerRef}>
          {/* Local Video */}
          <div className="participant-container local-participant">
            <div className="participant-video-container">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
                className={`participant-video ${!isCameraOn ? 'camera-off' : ''}`}
            />
              <div className="participant-info">
                <div className="participant-name">
                  You {isInstructor && '(Instructor)'}
                </div>
                <div className="participant-controls">
                  {!isMicOn && <FaMicrophoneSlash className="participant-muted-icon" />}
                </div>
              </div>
            </div>
          </div>
          
          {/* Remote Participants */}
          {Array.from(peers.values()).map(renderParticipantVideo)}
                </div>
        
        {/* Chat Panel */}
        {isChatOpen && (
          <div className="chat-panel">
            <Chat 
              messages={chatMessages} 
              onSendMessage={sendChatMessage} 
              currentUser={currentUser} 
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="meeting-controls">
        <button
          className={`control-button ${isMicOn ? 'active' : ''}`} 
          onClick={toggleMicrophone}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          <span>{isMicOn ? 'Mute' : 'Unmute'}</span>
        </button>

        <button
          className={`control-button ${isCameraOn ? 'active' : ''}`} 
          onClick={toggleCamera}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
          <span>{isCameraOn ? 'Stop Video' : 'Start Video'}</span>
        </button>
        
        <button
          className={`control-button ${isScreenSharing ? 'active' : ''}`} 
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop screen sharing' : 'Share your screen'}
        >
          {isScreenSharing ? <MdStopScreenShare /> : <MdScreenShare />}
          <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
        </button>
        
        <button
          className={`control-button ${isChatOpen ? 'active' : ''}`} 
          onClick={toggleChat}
          title={isChatOpen ? 'Close chat' : 'Open chat'}
        >
          {isChatOpen ? <IoMdChatboxes /> : <IoMdChatbubbles />}
          <span>{isChatOpen ? 'Close Chat' : 'Open Chat'}</span>
        </button>

        {isInstructor ? (
          // Instructor gets "End Meeting" button that ends for all
          <button 
            className="control-button end-button" 
            onClick={endMeeting}
            title="End meeting for all participants"
          >
            <RiCloseCircleFill />
            <span>End Meeting</span>
          </button>
        ) : (
          // Non-instructors get "Leave Meeting" button
        <button
            className="control-button leave-button" 
          onClick={leaveMeeting}
            title="Leave the meeting"
        >
            <MdExitToApp />
            <span>Leave</span>
        </button>
        )}
      </div>
    </div>
  );
};

export default VideoConference;
