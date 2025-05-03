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
  
  // URLs for backend and socket
  const backendUrl = process.env.REACT_APP_BACKEND 
  const socketUrl = process.env.REACT_APP_SOCKET_URL 
  // Component states
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [peers, setPeers] = useState(new Map());
  const [classDetails, setClassDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isInstructor, setIsInstructor] = useState(currentUser.role === 'instructor');
  const [isEnding, setIsEnding] = useState(false);
  
  // Refs
  const mediasoupClientRef = useRef(null);
  const localVideoRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // Debug logging function
  const debugLog = (section, message, data = null) => {
    console.log(`[VideoConference][${section}] ${message}`, data || '');
  };

  // Initialize MediaSoup client and set up callbacks
  useEffect(() => {
    debugLog('Init', 'Initializing MediaSoup client');
    mediasoupClientRef.current = new MediasoupClient();
    const mediasoupClient = mediasoupClientRef.current;
    
    // Connection callback
    mediasoupClient.onConnect = () => {
      debugLog('Connection', 'Connected to signaling server');
      setIsConnected(true);
    };
    
    // Disconnection callback
    mediasoupClient.onDisconnect = (reason) => {
      debugLog('Connection', 'Disconnected from server', reason);
      setIsConnected(false);
      setErrorMessage(`Disconnected: ${reason}`);
    };
    
    // New user joined callback
    mediasoupClient.onUserJoined = (user) => {
      debugLog('Participants', 'New user joined', user);
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
    
    // User left callback
    mediasoupClient.onUserLeft = (data) => {
      debugLog('Participants', 'User left', data);
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        newPeers.delete(data.peerId);
        return newPeers;
      });
    };
    
    // New consumer callback
    mediasoupClient.onNewConsumer = (data) => {
      debugLog('Media', 'New consumer received', data);
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        const peer = newPeers.get(data.peerId) || {
          id: data.peerId,
          name: data.peerName,
          consumers: []
        };
        peer.consumers = [...peer.consumers.filter(c => c.mediaType !== data.mediaType), {
            id: data.consumerId,
            mediaType: data.mediaType,
            track: data.track
        }];
        newPeers.set(data.peerId, peer);
        return newPeers;
      });
    };
    
    // Producer state change callback
    mediasoupClient.onProducerStateChanged = (data) => {
      debugLog('Media', 'Producer state changed', data);
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        const peer = newPeers.get(data.peerId);
        if (peer) {
          if (data.state === 'closed') {
            peer.consumers = peer.consumers.filter(c => c.mediaType !== data.mediaType);
          } else {
            peer.consumers = peer.consumers.map(consumer => 
              consumer.mediaType === data.mediaType 
                ? { ...consumer, paused: data.state === 'paused' }
                : consumer
            );
          }
          newPeers.set(data.peerId, peer);
        }
        return newPeers;
      });
    };
    
    // Chat message callback
    mediasoupClient.onChatMessage = (message) => {
      debugLog('Chat', 'New message received', message);
      setChatMessages(prevMessages => [...prevMessages, message]);
    };
    
    return () => {
      debugLog('Cleanup', 'Disconnecting MediaSoup client');
        mediasoupClient.disconnect().catch(console.error);
    };
  }, []);
  
  // Connect to server and join room
  useEffect(() => {
    const initializeConnection = async () => {
      if (!mediasoupClientRef.current) {
        debugLog('Error', 'MediaSoup client not initialized');
        return;
        }

      try {
        debugLog('Connection', 'Starting connection process', {
          userId: currentUser.id,
          userName: currentUser.name,
          role: currentUser.role
        });
      
        // Connect to signaling server
        await mediasoupClientRef.current.connect(socketUrl, token, {
        userId: currentUser.id,
        userName: currentUser.name,
          userRole: currentUser.role
        });

        debugLog('Room', 'Attempting to join room', { classId });

        // Join the room
        const { joined, peers } = await mediasoupClientRef.current.joinRoom(classId, {
            name: currentUser.name,
          role: currentUser.role
          });

          if (joined) {
          debugLog('Room', 'Successfully joined room', { 
            peersCount: peers?.length || 0 
          });
      
            // Start camera and microphone
            const stream = await mediasoupClientRef.current.startCamera();
            if (stream && localVideoRef.current) {
            debugLog('Media', 'Local stream obtained and attached');
            localVideoRef.current.srcObject = stream;
              setIsCameraOn(true);
              setIsMicOn(true);
            } else {
            debugLog('Media', 'No local stream or video ref not ready');
              setIsCameraOn(false);
              setIsMicOn(false);
          }
          }
      } catch (error) {
        debugLog('Error', 'Connection failed', error);
          setErrorMessage(`Failed to connect: ${error.message}`);
      }
    };

    initializeConnection();
  }, [classId, socketUrl, token, currentUser.id, currentUser.name, currentUser.role]);
  
  // Handle media controls
  const toggleMicrophone = async () => {
    try {
      debugLog('Controls', `Toggling microphone to ${!isMicOn}`);
      await mediasoupClientRef.current?.toggleMicrophone(!isMicOn);
        setIsMicOn(!isMicOn);
    } catch (error) {
      debugLog('Error', 'Failed to toggle microphone', error);
      setErrorMessage(`Microphone control failed: ${error.message}`);
    }
  };
  
  const toggleCamera = async () => {
    try {
      debugLog('Controls', `Toggling camera to ${!isCameraOn}`);
      await mediasoupClientRef.current?.toggleCamera(!isCameraOn);
        setIsCameraOn(!isCameraOn);
    } catch (error) {
      debugLog('Error', 'Failed to toggle camera', error);
      setErrorMessage(`Camera control failed: ${error.message}`);
    }
  };
  
  const toggleScreenShare = async () => {
    try {
      debugLog('Controls', `Toggling screen share to ${!isScreenSharing}`);
        if (isScreenSharing) {
        await mediasoupClientRef.current?.stopScreenSharing();
        } else {
        await mediasoupClientRef.current?.startScreenSharing();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      debugLog('Error', 'Screen sharing failed', error);
      setErrorMessage(`Screen share failed: ${error.message}`);
    }
  };
  
  // Handle meeting controls
  const leaveMeeting = async () => {
    try {
      debugLog('Controls', 'Leaving meeting');
      await mediasoupClientRef.current?.disconnect();
      navigate(-1);
    } catch (error) {
      debugLog('Error', 'Error leaving meeting', error);
      navigate(-1);
          }
  };
        
  const endMeeting = async () => {
    try {
      // Set ending state to show transition UI
      setIsEnding(true);
      console.log('=== END MEETING PROCESS STARTED ===');

      // Step 1: Backend API Call
      console.log('Step 1: Making backend API call to end class');
        const response = await fetch(`${backendUrl}/classes/classes/${classId}/end`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ instructorId: currentUser.id }),
        });

      const data = await response.json();
      console.log('Backend API Response:', data);

        if (!response.ok) {
        console.error('Backend API Error:', data);
        throw new Error(data.message || 'Failed to end meeting');
        }

      // Step 2: MediaSoup Cleanup (with timeout)
      console.log('Step 2: Starting MediaSoup cleanup');
      try {
        const cleanupPromise = Promise.race([
          (async () => {
            if (mediasoupClientRef.current) {
              try {
        await mediasoupClientRef.current.endMeeting(classId);
                console.log('endMeeting completed');
              } catch (e) {
                console.error('Error in endMeeting:', e);
              }
        
              try {
        await mediasoupClientRef.current.disconnect();
                console.log('disconnect completed');
              } catch (e) {
                console.error('Error in disconnect:', e);
              }
            }
          })(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('MediaSoup cleanup timeout')), 2000))
        ]);

        await cleanupPromise;
      } catch (mediaError) {
        console.error('MediaSoup cleanup error or timeout:', mediaError);
      }

      // Step 3: Local Resource Cleanup
      console.log('Step 3: Cleaning up local resources');
      try {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => {
            try {
              track.stop();
            } catch (e) {
              console.error('Error stopping track:', e);
            }
          });
          localVideoRef.current.srcObject = null;
        }
      } catch (cleanupError) {
        console.error('Local cleanup error:', cleanupError);
      }

      // Step 4: State Cleanup
      console.log('Step 4: Clearing state');
      setPeers(new Map());
      setIsConnected(false);

      // Step 5: Navigation with delay for transition
      console.log('Step 5: Preparing navigation');
      const navigationPath = isInstructor 
        ? `/instructor/${currentUser.id}/dashboard`
        : `/learner/${currentUser.id}/dashboard`;

      // Wait for transition animation
      setTimeout(() => {
        window.location.replace(navigationPath);
      }, 1000);

    } catch (error) {
      console.error('=== END MEETING ERROR ===');
      console.error('Error details:', error);
      setIsEnding(false);
      
      const fallbackPath = isInstructor 
        ? `/instructor/${currentUser.id}/dashboard`
        : `/learner/${currentUser.id}/dashboard`;
      
      window.location.replace(fallbackPath);
    }
  };
  
  // Chat functions
  const toggleChat = () => {
    debugLog('Chat', `Toggling chat to ${!isChatOpen}`);
    setIsChatOpen(!isChatOpen);
  };

  const sendChatMessage = (message) => {
    debugLog('Chat', 'Sending message', message);
    if (mediasoupClientRef.current) {
      mediasoupClientRef.current.sendChatMessage(message);
    }
  };

  // Add a new useEffect for handling video streams
  useEffect(() => {
    const attachStreams = () => {
      debugLog('Streams', 'Updating video streams', {
        peersCount: peers.size,
        peersData: Array.from(peers.entries()).map(([id, peer]) => ({
          id,
          name: peer.name,
          role: peer.role,
          consumersCount: peer.consumers.length,
          consumers: peer.consumers.map(consumer => ({
            id: consumer.id,
            type: consumer.mediaType,
            hasTrack: !!consumer.track,
            trackEnabled: consumer.track?.enabled,
            trackMuted: consumer.track?.muted
          }))
        }))
      });

      peers.forEach((peer, peerId) => {
        debugLog('Peer', `Processing streams for peer ${peer.name}`, {
          peerId,
          consumers: peer.consumers
        });

        peer.consumers.forEach(consumer => {
          if (!consumer.track) {
            debugLog('Error', `No track found for consumer ${consumer.id}`);
            return;
          }

          // Verify track is ready and enabled
          if (!consumer.track.enabled || consumer.track.readyState === 'ended') {
            debugLog('Error', `Track not ready or enabled for consumer ${consumer.id}`);
            return;
          }

          const elementId = `video-${peerId}-${consumer.mediaType}`;
          const videoElement = document.getElementById(elementId);
          
          if (!videoElement) {
            debugLog('Error', `Video element not found: ${elementId}`);
            return;
          }

          if (!(videoElement instanceof HTMLVideoElement)) {
            debugLog('Error', `Element is not a video element: ${elementId}`);
            return;
          }

          // Check if we need to update the stream
          const currentTrack = videoElement.srcObject?.getTracks()[0];
          if (currentTrack === consumer.track) {
            debugLog('Stream', `Stream already attached for ${consumer.mediaType} of peer ${peer.name}`);
            return;
          }

          try {
            debugLog('Stream', `Attaching ${consumer.mediaType} stream for peer ${peer.name}`, {
              elementId,
              trackId: consumer.track.id
            });

            const stream = new MediaStream([consumer.track]);
            videoElement.srcObject = stream;

            // Add loadedmetadata event listener
            videoElement.addEventListener('loadedmetadata', () => {
              videoElement.play()
                .then(() => {
                  debugLog('Stream', `Successfully playing ${consumer.mediaType} for peer ${peer.name}`);
                })
                .catch(error => {
                  debugLog('Error', `Failed to play ${consumer.mediaType} for peer ${peer.name}`, error);
                });
            }, { once: true });

          } catch (error) {
            debugLog('Error', `Failed to create MediaStream for peer ${peer.name}`, error);
          }
        });
      });
    };

    attachStreams();
  }, [peers]);

  // Update the renderParticipantVideo function
  const renderParticipantVideo = (peer) => {
    debugLog('Render', 'Rendering participant video', {
      peerId: peer.id,
      name: peer.name,
      role: peer.role,
      consumers: peer.consumers
    });

    const videoConsumer = peer.consumers.find(c => c.mediaType === 'video');
    const screenConsumer = peer.consumers.find(c => c.mediaType === 'screen');
    const audioConsumer = peer.consumers.find(c => c.mediaType === 'audio');
    const hasVideo = videoConsumer || screenConsumer;
    
    return (
      <div key={peer.id} className="participant-container">
        <div className="participant-video-container">
          {screenConsumer ? (
            <video
              id={`video-${peer.id}-screen`}
              autoPlay
              playsInline
              muted={!audioConsumer}
              className="participant-video screen-share"
              onLoadedMetadata={(e) => {
                debugLog('Video', `Screen share video loaded for peer ${peer.name}`);
                e.target.play().catch(err => debugLog('Error', `Failed to play screen share: ${err}`));
              }}
              onError={(e) => {
                debugLog('Error', `Screen share video error for peer ${peer.name}`, e);
              }}
            />
          ) : (
            <video
              id={`video-${peer.id}-video`}
              autoPlay
              playsInline
              muted={!audioConsumer}
              className={`participant-video ${!hasVideo ? 'camera-off' : ''}`}
              onLoadedMetadata={(e) => {
                debugLog('Video', `Video loaded for peer ${peer.name}`);
                e.target.play().catch(err => debugLog('Error', `Failed to play video: ${err}`));
              }}
              onError={(e) => {
                debugLog('Error', `Video error for peer ${peer.name}`, e);
              }}
            />
          )}
          {!hasVideo && (
            <div className="no-video-overlay">
              <div className="no-video-avatar">
                {peer.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <div className="participant-info">
            <div className="participant-name">
              {peer.name} 
              {peer.role === 'instructor' && (
                <span className="instructor-badge">Teacher</span>
              )}
            </div>
            <div className="participant-controls">
              {!audioConsumer && (
                <FaMicrophoneSlash className="participant-muted-icon" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate grid layout
  const calculateGridLayout = () => {
    const participantCount = peers.size + 1;
    if (participantCount <= 2) return 'grid-cols-1';
    if (participantCount <= 4) return 'grid-cols-2';
    if (participantCount <= 9) return 'grid-cols-3';
      return 'grid-cols-4';
  };
  
  // Main render
  return (
    <div className={`video-conference-container ${isChatOpen ? 'chat-open' : ''} ${isEnding ? 'ending' : ''}`}>
      {isEnding && (
        <div className="ending-overlay">
          <div className="ending-content">
            <div className="ending-spinner"></div>
            <h2>Ending Meeting...</h2>
            <p>Please wait while we clean up...</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="error-overlay">
        <div className="error-message">
            <p>{errorMessage}</p>
            <button onClick={leaveMeeting}>Leave Meeting</button>
          </div>
        </div>
      )}

      <div className="meeting-info">
        <h2>{classDetails?.title || 'Live Class'}</h2>
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
          <button 
            className="control-button end-button" 
            onClick={endMeeting}
            title="End meeting for all participants"
          >
            <RiCloseCircleFill />
            <span>End Meeting</span>
          </button>
        ) : (
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
