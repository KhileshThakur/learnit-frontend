import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
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
  
  // Socket and media refs
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  
  // Mediasoup specific refs
  const deviceRef = useRef(null);
  const producersRef = useRef(new Map()); // producerId => producer
  const consumersRef = useRef(new Map()); // consumerId => consumer
  const producerTransportRef = useRef(null);
  const consumerTransportRef = useRef(null);
  
  // Reference to the functions to be accessible outside the effect
  const toggleScreenShareRef = useRef(null);
  const stopScreenSharingRef = useRef(null);
  
  // Add connection status ref to prevent multiple initializations
  const isInitializedRef = useRef(false);
  const deviceInitializedRef = useRef(false);
  
  // Device change listener effect
  useEffect(() => {
    const handleDeviceChange = async () => {
      console.log('Media devices changed, updating available devices...');
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Available devices:', devices.length);
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);
  
  // Fetch class details effect
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
  
  // Main video conference initialization effect
  useEffect(() => {
    if (!classDetails && !(currentUser && currentUser.role === 'instructor')) {
      console.log('Waiting for class details before initializing mediasoup...');
      return;
    }

    // Prevent multiple initializations
    if (isInitializedRef.current) {
      console.log('Connection already initialized, skipping...');
      return;
    }
    isInitializedRef.current = true;
    
    // Add class to body when component mounts
    document.body.classList.add('video-conference-active');
    
    console.log('Initializing mediasoup connection...');
    
    // Add beforeunload event listener to prevent accidental navigation
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the meeting?';
      return 'Are you sure you want to leave the meeting?';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Initialize mediasoup device only once
    if (!deviceInitializedRef.current) {
    deviceRef.current = new mediasoupClient.Device();
      deviceInitializedRef.current = true;
    }

    // Handle device access with retry
    const getDeviceAccess = async (retryCount = 0) => {
      try {
        console.log('Requesting local media access...');
        
        // Always request a new stream instead of reusing
        // Try to get available devices first
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideo = devices.some(device => device.kind === 'videoinput');
        const hasAudio = devices.some(device => device.kind === 'audioinput');

        // Clean up any existing stream first
        cleanupDeviceAccess();

        // Adjust constraints based on available devices and role
        const constraints = {
          video: hasVideo ? {
            width: { ideal: 320 },
            height: { ideal: 240 },
            frameRate: { ideal: 15 }
          } : false,
          audio: hasAudio ? {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          } : false
        };

        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Successfully acquired media stream:', 
            stream.getTracks().map(t => `${t.kind}:${t.readyState}`).join(', '));
          
          // Store the new stream
          localStreamRef.current = stream;
          return stream;
        } catch (error) {
          if (error.name === 'NotReadableError' || error.name === 'NotAllowedError') {
            if (retryCount < 2) {
              console.log('Device access failed, retrying in 1 second...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              return getDeviceAccess(retryCount + 1);
            }
          }
          
          // Create fallback stream with dummy tracks
          console.log('Creating fallback stream with dummy tracks');
          const fallbackStream = new MediaStream();
          
          // Create a dummy video track using canvas
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          
          // Draw background
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw user initial
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
          ctx.fillText(initial, canvas.width / 2, canvas.height / 2);
          
          const dummyVideoTrack = canvas.captureStream(1).getVideoTracks()[0];
          fallbackStream.addTrack(dummyVideoTrack);
          
          // Store the fallback stream
          localStreamRef.current = fallbackStream;
          return fallbackStream;
        }
      } catch (error) {
        console.error('Fatal error accessing media devices:', error);
        throw error;
      }
    };

    // Update the cleanup function to be more thorough
    const cleanupDeviceAccess = () => {
      if (localStreamRef.current) {
        console.log('Cleaning up existing media stream...');
        const tracks = localStreamRef.current.getTracks();
        tracks.forEach(track => {
          try {
            track.stop();
          } catch (error) {
            console.warn('Error stopping track:', error);
          }
        });
        localStreamRef.current = null;
      }
    };
    
    const connectSocket = async () => {
      try {
        // Prevent multiple socket connections
        if (socketRef.current?.connected) {
          console.log('Socket already connected, skipping connection...');
          return;
        }

        // Client-side connection diagnostics
        console.log('SOCKET CONNECTION DIAGNOSTICS:');
        console.log('- API URL:', backendurl);
        console.log('- Socket URL:', socketUrl);
        console.log('- Class ID:', classId);
        console.log('- User:', currentUser?.name || 'Unknown', '(', currentUser?.role || 'Unknown role', ')');
        
        // Create connection to signaling server
        socketRef.current = io(socketUrl, {
          path: '/socket.io',
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 20000,
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
          setErrorMessage(`Connection error: ${err.message}. Please check your internet connection.`);
        });
        
        // Successful connection
        socket.on('connect', async () => {
          console.log('Connected to signaling server successfully with socket ID:', socket.id);
          setErrorMessage('');
          
          try {
            // Get router RTP capabilities
            const { rtpCapabilities, error } = await new Promise((resolve) => {
              socket.emit('getRouterRtpCapabilities', resolve);
            });
            
            if (error) {
              throw new Error(error);
            }
            
            if (!rtpCapabilities) {
              throw new Error('No RTP capabilities received from server');
            }
            
            console.log('Successfully received RTP capabilities');
            
            // Load the device with the router's RTP capabilities
            if (!deviceRef.current.loaded) {
            await deviceRef.current.load({ routerRtpCapabilities: rtpCapabilities });
            }
            
            // Now we can join the room
            joinRoom();
          } catch (error) {
            console.error('Error loading mediasoup device:', error);
            setErrorMessage(`Failed to initialize: ${error.message}`);
          }
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
        socket.on('existingUsers', async (users) => {
          console.log('Existing users in room:', users);
          if (users && users.length > 0) {
            // Filter out duplicate users and self
            const uniqueUsers = users.filter((user, index, self) => 
              // Remove duplicates based on userId
              index === self.findIndex((u) => u.userId === user.userId) &&
              // Remove self from the peers list
              user.userId !== currentUser?.id
            );
            setPeers(uniqueUsers);
            
            // Create consumer transport if it doesn't exist
            if (!consumerTransportRef.current && deviceRef.current.loaded) {
              await createConsumerTransport();
            }
            
            // Get all producers
            socket.emit('getProducers', (producers) => {
              if (Array.isArray(producers)) {
                for (const producer of producers) {
                  // Consume each producer
                  consumeProducer(producer);
                }
              }
            });
          }
        });
        
        // New user joined
        socket.on('userJoined', async (user) => {
          if (!user || user.userId === currentUser?.id) return;
          console.log('User joined:', user);
          
          // Check if user already exists in peers
          setPeers(prevPeers => {
            // If user already exists, don't add them again
            if (prevPeers.some(peer => peer.userId === user.userId)) {
              return prevPeers;
            }
            return [...prevPeers, user];
          });
        });
        
        // User left
        socket.on('userLeft', ({ userId }) => {
          console.log('User left:', userId);
          setPeers(prevPeers => {
            // Remove the peer and their associated streams
            const updatedPeers = prevPeers.filter(peer => peer.userId !== userId);
            
            // Cleanup any consumers associated with this peer
            consumersRef.current.forEach((consumer, consumerId) => {
              if (consumer.appData.peerId === userId) {
                consumer.close();
                consumersRef.current.delete(consumerId);
              }
            });
            
            return updatedPeers;
          });
        });
        
        // Listen for user state updates (camera/mic status)
        socket.on('userStateUpdate', ({ userId, cameraOff, micOff }) => {
          console.log(`User ${userId} state update: camera=${cameraOff ? 'OFF' : 'ON'}, mic=${micOff ? 'OFF' : 'ON'}`);
          setPeers(prevPeers => 
            prevPeers.map(peer => {
              if (peer.userId === userId) {
                return {
                  ...peer,
                  cameraOff: cameraOff !== undefined ? cameraOff : peer.cameraOff,
                  micOff: micOff !== undefined ? micOff : peer.micOff
                };
              }
              return peer;
            })
          );
        });
        
        // New producer available
        socket.on('newProducer', async (producerData) => {
          console.log('New producer available:', producerData);
          
          // Create consumer transport if it doesn't exist
          if (!consumerTransportRef.current && deviceRef.current.loaded) {
            await createConsumerTransport();
          }
          
          // Consume the new producer
          await consumeProducer(producerData);
        });
        
        // Consumer closed
        socket.on('consumerClosed', ({ consumerId }) => {
          const consumer = consumersRef.current.get(consumerId);
          if (consumer) {
            consumer.close();
            consumersRef.current.delete(consumerId);
          }
        });
        
        // Producer updated (for screen sharing)
        socket.on('producerUpdated', ({ producerId, peerId, kind }) => {
          console.log(`Producer ${producerId} from peer ${peerId} was updated, kind: ${kind}`);
        });
        
        // Socket error
        socket.on('error', (error) => {
          console.error('Socket error:', error);
          setErrorMessage(`Socket error: ${error?.message || 'Unknown error'}`);
        });

        // After all other socket event handlers are set up
        socket.onAny((event, ...args) => {
          // Log all events for debugging
          console.log(`Socket.io event: ${event}`, args);
        });
      } catch (error) {
        console.error('Error initializing connection:', error);
        setErrorMessage('Failed to initialize: ' + (error?.message || 'Unknown error'));
      }
    };
    
    // Join Room function
    const joinRoom = async () => {
      const socket = socketRef.current;
      
      if (!socket || !socket.connected) {
        console.error('Socket not connected, cannot join room');
        setErrorMessage('Connection error: socket not connected');
        return;
      }
      
      try {
        console.log('Starting join room process...');
        
        // Get local media stream using the getDeviceAccess function
        const stream = await getDeviceAccess();
        
        console.log('Media access granted:', stream.getTracks().map(t => t.kind).join(', '));
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Create send transport
        console.log('Creating producer transport...');
        const producerTransport = await createProducerTransport();
        console.log('Producer transport created successfully');
        
        // Produce tracks if we have them
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log('Producing audio track...');
          try {
            await produceTrack(audioTracks[0], 'audio');
            console.log('Audio track produced successfully');
          } catch (error) {
            console.error('Failed to produce audio track:', error);
            // Continue even if audio fails
          }
        } else {
          console.warn('No audio tracks found in local stream');
        }
        
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          console.log('Producing video track...');
          try {
            await produceTrack(videoTracks[0], 'video');
            console.log('Video track produced successfully');
          } catch (error) {
            console.error('Failed to produce video track:', error);
            // Continue even if video fails
          }
        } else {
          console.warn('No video tracks found in local stream');
        }
        
        // Join room
        console.log('Joining socket.io room...');
        socket.emit('joinRoom', {
          roomId: classId,
          userId: currentUser?.id || 'anonymous',
          userName: currentUser?.name || currentUser?.email || 'Anonymous User'
        });
        
        setIsConnected(true);
        console.log('Join room process completed');
      } catch (error) {
        console.error('Error joining room:', error);
        setErrorMessage('Failed to join room: ' + error.message);
        
        // Try to reconnect or provide fallback experience
        setIsConnected(true); // Set to true anyway to allow UI to render
        setPeers([
          { userId: 'mock-1', userName: 'Demo User 1' },
          { userId: 'mock-2', userName: 'Demo User 2' }
        ]);
      }
    };
    
    // Create producer transport
    const createProducerTransport = async () => {
      const socket = socketRef.current;
      
      try {
        console.log('Requesting WebRTC transport for sending media');
        
        // Request a WebRTC transport for sending media with retry logic
        const response = await new Promise((resolve, reject) => {
          let hasResolved = false;
          
          // Function to make the request
          const makeRequest = (attempt = 1) => {
            console.log(`Attempt ${attempt} to create producer transport`);
            
            socket.emit('createWebRtcTransport', { sender: true }, (response) => {
              if (hasResolved) return;
              
              // If we got an error and haven't exceeded max attempts, retry
              if (response.error && attempt < 3) {
                console.warn(`Attempt ${attempt} failed with error: ${response.error}, retrying...`);
                setTimeout(() => makeRequest(attempt + 1), 1000);
                return;
              }
              
              // Otherwise resolve with what we got
              hasResolved = true;
              if (timeoutId) clearTimeout(timeoutId);
              resolve(response);
            });
          };
          
          // Start the first attempt
          makeRequest();
          
          // Set timeout for the entire operation
          const timeoutId = setTimeout(() => {
            if (hasResolved) return;
            hasResolved = true;
            reject(new Error('Timeout creating producer transport'));
          }, 15000);
        });
        
        // Check for errors
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Check for params
        if (!response.params) {
          throw new Error('No transport parameters received');
        }
        
        console.log('Successfully received transport parameters, creating send transport');
        
        // Create the sending transport in the client device
        const transport = deviceRef.current.createSendTransport(response.params);
        
        // Handle transport events
        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            console.log('Transport connect event, sending dtlsParameters');
            // Signal to the server to establish the transport connection
            await new Promise((resolve) => {
              socket.emit('connectWebRtcTransport', 
                { transportId: transport.id, dtlsParameters }, 
                resolve
              );
            });
            
            // Tell the transport that the parameters were transmitted
            callback();
          } catch (error) {
            errback(error);
          }
        });
        
        transport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {
            // Tell the server to create a Producer with the specified parameters
            const { id } = await new Promise((resolve) => {
              socket.emit('produce', 
                { transportId: transport.id, kind, rtpParameters, appData }, 
                resolve
              );
            });
            
            // Tell the transport that parameters were transmitted and provide it with the server side producer's id
            callback({ id });
          } catch (error) {
            errback(error);
          }
        });
        
        producerTransportRef.current = transport;
      } catch (error) {
        console.error('Error creating producer transport:', error);
        throw error;
      }
    };
    
    // Create consumer transport
    const createConsumerTransport = async () => {
      const socket = socketRef.current;
      let retryCount = 0;
      const maxRetries = 3;
      const timeoutDuration = 30000; // 30 seconds timeout
      
      const attemptCreateTransport = async () => {
      try {
          console.log(`Attempting to create consumer transport (attempt ${retryCount + 1}/${maxRetries})`);
        
          // Request a WebRTC transport for receiving media
        const response = await new Promise((resolve, reject) => {
          let hasResolved = false;
          
            const timeoutId = setTimeout(() => {
              if (!hasResolved) {
                hasResolved = true;
                reject(new Error('Timeout creating consumer transport'));
              }
            }, timeoutDuration);
            
            socket.emit('createWebRtcTransport', { sender: false }, (response) => {
              if (!hasResolved) {
              hasResolved = true;
                clearTimeout(timeoutId);
              resolve(response);
              }
            });
        });
        
        // Check for errors
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Check for params
        if (!response.params) {
          throw new Error('No transport parameters received');
        }
        
        console.log('Successfully received transport parameters, creating receive transport');
        
        // Create the receiving transport in the client device
        const transport = deviceRef.current.createRecvTransport(response.params);
        
        // Handle transport events
        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            console.log('Consumer transport connect event, sending dtlsParameters');
              await new Promise((resolve, reject) => {
                const connectTimeout = setTimeout(() => {
                  reject(new Error('Connect transport timeout'));
                }, 10000);
                
              socket.emit('connectWebRtcTransport', 
                { transportId: transport.id, dtlsParameters }, 
                  (response) => {
                    clearTimeout(connectTimeout);
                    if (response?.error) {
                      reject(new Error(response.error));
                    } else {
                      resolve(response);
                    }
                  }
              );
            });
            
            console.log('Consumer transport connected successfully');
            callback();
          } catch (error) {
            console.error('Error in consumer transport connect event:', error);
            errback(error);
          }
        });
        
        consumerTransportRef.current = transport;
        console.log('Consumer transport created successfully');
        return transport;
          
      } catch (error) {
          console.error(`Error creating consumer transport (attempt ${retryCount + 1}):`, error);
          
          if (retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`Retrying in 2 seconds... (${maxRetries - retryCount} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return attemptCreateTransport();
          }
        throw error;
        }
      };
      
      try {
        return await attemptCreateTransport();
      } catch (error) {
        console.error('All attempts to create consumer transport failed:', error);
        setErrorMessage('Failed to establish video connection. Please try refreshing the page.');
        // Return null instead of throwing to prevent uncaught promise rejection
        return null;
      }
    };
    
    // Produce a track (audio or video)
    const produceTrack = async (track, kind) => {
      const transport = producerTransportRef.current;
      
      if (!transport) {
        throw new Error('Producer transport not created');
      }
      
      // Create producer for the track
      const producer = await transport.produce({ 
        track, 
        encodings: kind === 'video' ? [
          { maxBitrate: 100000 },
          { maxBitrate: 300000 },
          { maxBitrate: 900000 }
        ] : undefined,
        codecOptions: kind === 'video' ? { videoGoogleStartBitrate: 1000 } : undefined,
        appData: { kind }
      });
      
      // Store the producer
      producersRef.current.set(producer.id, producer);
      
      // Handle producer events
      producer.on('trackended', () => {
        console.log(`${kind} track ended`);
        producer.close();
        producersRef.current.delete(producer.id);
      });
      
      return producer;
    };
    
    // Update the peers state when adding streams
    const updatePeerStream = (peerId, newTrack) => {
      setPeers(prevPeers => 
        prevPeers.map(peer => {
          if (peer.userId === peerId) {
            // Create new stream or add track to existing stream
            const stream = peer.stream || new MediaStream();
            
            // Remove any existing tracks of the same kind
            const existingTracks = stream.getTracks();
            existingTracks.forEach(track => {
              if (track.kind === newTrack.kind) {
                stream.removeTrack(track);
              }
            });
            
            // Add the new track
            stream.addTrack(newTrack);
            return { ...peer, stream };
          }
          return peer;
        })
      );
    };
    
    // Update the consumeProducer function to use updatePeerStream
    const consumeProducer = async ({ id: producerId, peerId, kind, appData }) => {
      const transport = consumerTransportRef.current;
      
      if (!transport) {
        console.warn('Consumer transport not ready, attempting to create...');
        try {
          const newTransport = await createConsumerTransport();
          if (!newTransport) {
            console.warn('Failed to create consumer transport, skipping consume');
        return;
          }
        } catch (error) {
          console.error('Error creating consumer transport:', error);
          return;
        }
      }
      
      try {
        // Request to consume the producer
        const { id, producerPeerId, rtpParameters } = await new Promise((resolve) => {
          socketRef.current.emit('consume', {
            transportId: transport.id,
            producerId,
            rtpCapabilities: deviceRef.current.rtpCapabilities
          }, resolve);
        });
        
        // Create consumer with the given producer
        const consumer = await transport.consume({
          id,
          producerId,
          kind,
          rtpParameters,
          appData: { ...appData, peerId: producerPeerId }
        });
        
        // Store the consumer
        consumersRef.current.set(consumer.id, consumer);
        
        // Resume the consumer
        await new Promise((resolve) => {
          socketRef.current.emit('resumeConsumer', { consumerId: consumer.id }, resolve);
        });
        
        // Update peer's stream using the helper function
        updatePeerStream(peerId, consumer.track);
        
        // Handle consumer closed
        consumer.on('close', () => {
          consumersRef.current.delete(consumer.id);
          // Update UI if needed
        setPeers(prevPeers => 
          prevPeers.map(peer => {
            if (peer.userId === peerId) {
                const stream = peer.stream;
                if (stream) {
                  const tracks = stream.getTracks();
                  tracks.forEach(track => {
                    if (track.kind === consumer.kind) {
                      stream.removeTrack(track);
                    }
                  });
                }
                return { ...peer, stream };
            }
            return peer;
          })
        );
        });
      } catch (error) {
        console.error('Error consuming producer:', error);
      }
    };
    
    // Function to toggle screen sharing
    const handleToggleScreenShare = async () => {
      try {
        if (!isScreenSharing) {
          // Start screen sharing
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
          });
          
          screenStreamRef.current = screenStream;
          
          // Get screen track
          const screenTrack = screenStream.getVideoTracks()[0];
          
          // Find the video producer
          let videoProducerId;
          let videoProducer;
          
          for (const [id, producer] of producersRef.current.entries()) {
            if (producer.kind === 'video') {
              videoProducerId = id;
              videoProducer = producer;
              break;
            }
          }
          
          // If we don't have a video producer or it's closed, create a new one
          if (!videoProducer || videoProducer.closed) {
            console.log('Video producer not found or closed, creating new producer for screen sharing');
            
            // Create a new producer for screen sharing
            const newProducer = await produceTrack(screenTrack, 'video');
            
            // Update the videoProducerId for later reference
            videoProducerId = newProducer.id;
          } else {
            // Replace the video track in the existing producer
            await videoProducer.replaceTrack({ track: screenTrack });
            
            // Send info to the server about the track replacement
            await new Promise((resolve) => {
              socketRef.current.emit('replaceProducer', {
                producerId: videoProducerId,
                kind: 'video',
                rtpParameters: videoProducer.rtpParameters
              }, resolve);
            });
          }
          
          // Show screen share in local video
          if (localVideoRef.current) {
            const newStream = new MediaStream([
              screenTrack,
              ...localStreamRef.current.getAudioTracks()
            ]);
            localVideoRef.current.srcObject = newStream;
          }
          
          // Handle end of screen sharing
          screenTrack.onended = () => handleStopScreenSharing();
          
          setIsScreenSharing(true);
        } else {
          handleStopScreenSharing();
        }
      } catch (error) {
        console.error('Error with screen sharing:', error);
        // If user cancels the screen share dialog
        if (error.name === 'NotAllowedError') {
          console.log('Screen sharing permission denied by user');
        }
      }
    };
    
    // Function to stop screen sharing
    const handleStopScreenSharing = async () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        
        try {
          // Find the video producer
          let videoProducerId;
          let videoProducer;
          
          for (const [id, producer] of producersRef.current.entries()) {
            if (producer.kind === 'video') {
              videoProducerId = id;
              videoProducer = producer;
              break;
            }
          }
          
          // Get the original video track
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          
          if (videoProducer && !videoProducer.closed && videoTrack) {
            // Replace the screen track with the original video track
            await videoProducer.replaceTrack({ track: videoTrack });
            
            // Send info to the server about the track replacement
            await new Promise((resolve) => {
              socketRef.current.emit('replaceProducer', {
                producerId: videoProducerId,
                kind: 'video',
                rtpParameters: videoProducer.rtpParameters
              }, resolve);
            });
          } else if (videoTrack) {
            // If producer is closed or missing, create a new one
            console.log('Creating new video producer after screen sharing');
            await produceTrack(videoTrack, 'video');
          }
          
          // Restore local video
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        } catch (error) {
          console.error('Error stopping screen sharing:', error);
          
          // Fallback: if we can't properly stop screen sharing, attempt to recreate camera stream
          try {
            if (localStreamRef.current) {
              // Stop all tracks in current stream
              localStreamRef.current.getTracks().forEach(track => track.stop());
              
              // Request camera access again
              const newStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
              });
              
              localStreamRef.current = newStream;
              
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = newStream;
              }
              
              // Create new producers for the tracks
              const audioTracks = newStream.getAudioTracks();
              if (audioTracks.length > 0) {
                await produceTrack(audioTracks[0], 'audio');
              }
              
              const videoTracks = newStream.getVideoTracks();
              if (videoTracks.length > 0) {
                await produceTrack(videoTracks[0], 'video');
              }
            }
          } catch (fallbackError) {
            console.error('Fallback error:', fallbackError);
          }
          
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        }
      }
    };
    
    // Make these functions available outside the effect
    toggleScreenShareRef.current = handleToggleScreenShare;
    stopScreenSharingRef.current = handleStopScreenSharing;

    // Initialize the connection
    connectSocket();
    
    // Clean up on component unmount
    return () => {
      isInitializedRef.current = false;
      deviceInitializedRef.current = false;
      
      // Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close all producers
      producersRef.current.forEach(producer => {
        producer.close();
      });
      
      // Close all consumers
      consumersRef.current.forEach(consumer => {
        consumer.close();
      });
      
      // Close transports
      if (producerTransportRef.current) {
        producerTransportRef.current.close();
      }
      
      if (consumerTransportRef.current) {
        consumerTransportRef.current.close();
      }
      
      // Disconnect socket if it exists
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      // Remove class from body
      document.body.classList.remove('video-conference-active');
      
      // Remove beforeunload listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [classDetails, classId, currentUser, backendurl, socketUrl, token]);
  
  // Function to toggle microphone
  const toggleMic = async () => {
    if (!localStreamRef.current) return;
    
    try {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        // Set track enabled property directly
        const newMicState = !isMicOn;
        audioTracks.forEach(track => {
          track.enabled = newMicState;
        });
        
        // Find the audio producer
        for (const [id, producer] of producersRef.current.entries()) {
          if (producer.kind === 'audio') {
            // Pause/resume the producer - use the new state to determine action
            if (!newMicState) {
              await new Promise((resolve) => {
                socketRef.current?.emit('pauseProducer', { producerId: id }, resolve);
              });
              
              // Notify other users that mic is off
              socketRef.current?.emit('updateUserState', {
                roomId: classId,
                userId: currentUser?.id,
                micOff: true
              });
            } else {
              await new Promise((resolve) => {
                socketRef.current?.emit('resumeProducer', { producerId: id }, resolve);
              });
              
              // Notify other users that mic is on
              socketRef.current?.emit('updateUserState', {
                roomId: classId,
                userId: currentUser?.id,
                micOff: false
              });
            }
            break;
          }
        }
        
        // Update state after changing track
        setIsMicOn(newMicState);
        
        // Log for debugging
        console.log(`Microphone toggled to: ${newMicState ? 'ON' : 'OFF'}`);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };
  
  // Function to toggle camera
  const toggleCamera = async () => {
    if (!localStreamRef.current) return;
    
    try {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        // Set track enabled property directly using the opposite of current state
        const newCameraState = !isCameraOn;
        
        // Toggle track enabled state
        videoTracks.forEach(track => {
          track.enabled = newCameraState;
        });
        
        // Find the video producer that's not screen sharing
        for (const [id, producer] of producersRef.current.entries()) {
          if (producer.kind === 'video' && !isScreenSharing) {
            // Pause/resume the producer - use the new state to determine action
            if (!newCameraState) {
              await new Promise((resolve) => {
                socketRef.current?.emit('pauseProducer', { producerId: id }, resolve);
              });
              
              // Notify other users that camera is off
              socketRef.current?.emit('updateUserState', {
                roomId: classId,
                userId: currentUser?.id,
                cameraOff: true
              });
            } else {
              await new Promise((resolve) => {
                socketRef.current?.emit('resumeProducer', { producerId: id }, resolve);
              });
              
              // Notify other users that camera is on
              socketRef.current?.emit('updateUserState', {
                roomId: classId,
                userId: currentUser?.id,
                cameraOff: false
              });
            }
            break;
          }
        }
        
        // Update state after changing track
        setIsCameraOn(newCameraState);
        
        // Log for debugging
        console.log(`Camera toggled to: ${newCameraState ? 'ON' : 'OFF'}`);
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };
  
  // Function to toggle screen sharing (wrapper to call the function in the effect)
  const toggleScreenShare = () => {
    if (toggleScreenShareRef.current) {
      toggleScreenShareRef.current();
    } else {
      console.error('Screen sharing function not initialized');
    }
  };
  
  // Function to stop screen sharing (wrapper to call the function in the effect)
  const stopScreenSharing = () => {
    if (stopScreenSharingRef.current) {
      stopScreenSharingRef.current();
    } else {
      console.error('Stop screen sharing function not initialized');
    }
  };
  
  // Function to leave the meeting
  const leaveMeeting = () => {
    navigate(-1);
  };
  
  // Function to toggle chat
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
      
      // Close all producers
      producersRef.current.forEach(producer => {
        producer.close();
      });
      
      // Close all consumers
      consumersRef.current.forEach(consumer => {
        consumer.close();
      });
      
      // Close transports
      if (producerTransportRef.current) {
        producerTransportRef.current.close();
      }
      
      if (consumerTransportRef.current) {
        consumerTransportRef.current.close();
      }
      
      // Ensure socket is disconnected
      if (socketRef.current && socketRef.current.connected) {
        console.log('Disconnecting socket on unmount');
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  return (
    <div className="video-conference-page">
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      <div className="video-conference-container">
        {/* Local Video */}
        <VideoContainer 
          key={`local-${currentUser?.id}`}
          name={`${currentUser?.name || 'You'} (You)`} 
          isSelf={true} 
          micOff={!isMicOn} 
          cameraOff={!isCameraOn}>
          {localStreamRef.current ? (
            isCameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="video-element"
              />
            ) : (
              <div className="video-placeholder">
                <div className="avatar-circle">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'Y'}
                </div>
              </div>
            )
          ) : (
            <div className="video-placeholder">
              <span>Camera not available</span>
            </div>
          )}
        </VideoContainer>
        
        {/* Remote Videos */}
        {peers.map(peer => (
          <VideoContainer 
            key={`remote-${peer.userId}`}
            name={peer.userName || `User ${peer.userId}`}
            cameraOff={peer.cameraOff}
            micOff={peer.micOff}>
            {peer.stream ? (
              peer.cameraOff ? (
                <div className="video-placeholder">
                  <div className="avatar-circle">
                    {peer.userName ? peer.userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
              ) : (
                <video
                  autoPlay
                  playsInline
                  className="video-element"
                  srcObject={peer.stream}
                />
              )
            ) : (
              <div className="video-placeholder">
                <span>Video not available</span>
              </div>
            )}
          </VideoContainer>
        ))}
        
        {/* Add an extra div for bottom spacing to prevent content from being hidden behind the control bar */}
        <div style={{ height: '80px', visibility: 'hidden' }}></div>
      </div>
      
      {/* Controls */}
      <div className="video-controls">
        <button
          className={`control-button ${isMicOn ? 'active' : 'inactive'}`}
          onClick={toggleMic}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? '🎙️' : '🔇'}
        </button>
        
        <button
          className={`control-button ${isCameraOn ? 'active' : 'inactive'}`}
          onClick={toggleCamera}
          title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isCameraOn ? '📹' : '🚫'}
        </button>
        
        <button
          className={`control-button ${isScreenSharing ? 'active' : 'inactive'}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
        >
          {isScreenSharing ? '📵' : '📱'}
        </button>
        
        <button
          className="control-button chat-button"
          onClick={toggleChat}
          title={isChatOpen ? 'Close Chat' : 'Open Chat'}
        >
          💬
        </button>
        
        <button
          className="control-button leave-button"
          onClick={leaveMeeting}
          title="Leave Meeting"
        >
          ❌
        </button>
      </div>
      
      {/* Chat */}
      {isChatOpen && (
        <Chat
          roomId={classId}
          userName={currentUser?.name || 'Anonymous'}
          socket={socketRef.current}
          onClose={toggleChat}
        />
      )}
    </div>
  );
};

export default VideoConference;
