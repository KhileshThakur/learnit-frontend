import * as mediasoupClient from 'mediasoup-client';
import { io } from 'socket.io-client';

class MediasoupClient {
  constructor() {
    this.socket = null;
    this.device = null;
    this.producerTransport = null;
    this.consumerTransport = null;
    this.producers = new Map(); // Map of producers (audio, video, screen)
    this.consumers = new Map(); // Map of consumers by ID
    this.pendingConsumers = new Map(); // Map of pending consumers by peer ID
    
    // Initialize type-specific producer maps
    this.audioProducers = new Map();
    this.videoProducers = new Map();
    this.screenProducers = new Map();
    
    this.isConnected = false;
    this.roomId = null;
    this.userId = null;
    this.userName = null;
    this.userRole = null;
    this.peers = new Map(); // Map of peers
    
    // Callbacks
    this.onConnect = null;
    this.onDisconnect = null;
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onNewConsumer = null;
    this.onProducerStateChanged = null;
    this.onChatMessage = null;
    
    // Local media
    this.localStream = null;
    this.screenStream = null;
    
    // Debug flag
    this.debug = true;
  }
  
  log(...args) {
    if (this.debug) {
      console.log('[MediasoupClient]', ...args);
    }
  }
  
  error(...args) {
    if (this.debug) {
      console.error('[MediasoupClient]', ...args);
    }
  }
  
  async connect(socketUrl, token, userInfo = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.log('Connecting to socket server:', socketUrl);
        this.log('User info:', userInfo);
        
        // Store user data from userInfo if provided
        if (userInfo.userId) this.userId = userInfo.userId;
        if (userInfo.userName) this.userName = userInfo.userName;
        if (userInfo.userRole) this.userRole = userInfo.userRole;
        
        this.log('Initialized user data:', {
          userId: this.userId,
          userName: this.userName,
          userRole: this.userRole
        });
        
        this.socket = io(socketUrl, {
          path: '/socket.io',
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          autoConnect: true,
          forceNew: true,
          transports: ['websocket', 'polling'],
          auth: {
            token: token,
            userId: this.userId,
            userName: this.userName,
            userRole: this.userRole
          }
        });
        
        this.socket.on('connect', () => {
          this.log('Connected to signaling server');
          this.isConnected = true;
          if (this.onConnect) this.onConnect();
          resolve();
        });
        
        this.socket.on('connection_ack', (data) => {
          this.log('Connection acknowledged by server:', data);
          this.userId = data.peerId;
          this.userName = data.userName;
          this.userRole = data.role;
          this.log('Updated peer information:', {
            peerId: this.userId,
            userName: this.userName,
            role: this.userRole
          });
        });
        
        this.socket.on('connect_error', (error) => {
          this.error('Connection error:', error);
          if (this.onDisconnect) this.onDisconnect(error);
          reject(error);
        });
        
        this.socket.on('disconnect', (reason) => {
          this.log('Disconnected from signaling server:', reason);
          this.isConnected = false;
          if (this.onDisconnect) this.onDisconnect(reason);
        });
        
        // Set up signaling events
        this.setupSignalingEvents();
      } catch (error) {
        this.error('Error in connect:', error);
        reject(error);
      }
    });
  }
  
  setupSignalingEvents() {
    // User joined room
    this.socket.on('userJoined', (user) => {
      this.log('=== NEW USER JOINED ===');
      this.log('User ID:', user.peerId);
      this.log('User Name:', user.peerName);
      this.log('User Role:', user.role || 'unknown');
      this.log('======================');
      
      // Create peer if doesn't exist
      if (!this.peers.has(user.peerId)) {
        const newPeer = {
        id: user.peerId,
        name: user.peerName,
        role: user.role,
          consumers: []
        };
        this.peers.set(user.peerId, newPeer);
        
        // Check for any pending consumers for this peer
        const pendingConsumers = this.pendingConsumers.get(user.peerId);
        if (pendingConsumers && pendingConsumers.length > 0) {
          this.log(`Processing ${pendingConsumers.length} pending consumers for peer ${user.peerName}`);
          pendingConsumers.forEach(consumer => {
            newPeer.consumers.push(consumer);
            this.log(`Added pending consumer for ${user.peerName}:`, consumer);
          });
          this.pendingConsumers.delete(user.peerId);
          
          // Notify about new consumers
          if (this.onNewConsumer) {
            pendingConsumers.forEach(consumer => {
              this.onNewConsumer({
                peerId: user.peerId,
                peerName: user.peerName,
                consumerId: consumer.id,
                mediaType: consumer.mediaType,
                kind: consumer.track?.kind || 'video',
                track: consumer.track
              });
            });
          }
        }
      }
      
      if (this.onUserJoined) this.onUserJoined(user);
    });
    
    // User left room
    this.socket.on('userLeft', (data) => {
      this.log(`User left: ${this.peers.get(data.peerId)?.name || data.peerId}`);
      this.peers.delete(data.peerId);
      
      if (this.onUserLeft) this.onUserLeft(data);
    });
    
    // New producer
    this.socket.on('newProducer', async (data) => {
      this.log('=== NEW PRODUCER ===');
      this.log('Producer:', data);
      this.log('Current User ID:', this.userId);
      this.log('Producer Peer ID:', data.peerId);
      
      if (data.peerId !== this.userId) {
        try {
          // Create consumer
          const consumer = await this.consume(data.producerId);
          
          if (!consumer) {
            this.error('Failed to create consumer');
            return;
          }

          // Get or create peer
          let peer = this.peers.get(data.peerId);
          if (!peer) {
            this.log('Peer not found, creating temporary peer entry');
            peer = {
              id: data.peerId,
              name: data.peerName || 'Unknown',
              consumers: []
            };
            this.peers.set(data.peerId, peer);
            
            // Store consumer in pending map
            let pendingConsumers = this.pendingConsumers.get(data.peerId);
            if (!pendingConsumers) {
              pendingConsumers = [];
              this.pendingConsumers.set(data.peerId, pendingConsumers);
            }
            const consumerData = {
              id: consumer.id,
              mediaType: data.mediaType,
              track: consumer.track
            };
            pendingConsumers.push(consumerData);
            this.log('Added to pending consumers:', consumerData);
          } else {
            // Add consumer to peer
            const consumerData = {
              id: consumer.id,
              mediaType: data.mediaType,
              track: consumer.track
            };
            peer.consumers.push(consumerData);
            this.log('Added consumer to peer:', consumerData);
          }
          
          if (this.onNewConsumer) {
            this.onNewConsumer({
              peerId: data.peerId,
              peerName: peer.name,
              consumerId: consumer.id,
              mediaType: data.mediaType,
              kind: consumer.kind,
              track: consumer.track
            });
          }
        } catch (error) {
          this.error('Error consuming new producer:', error);
        }
      }
    });
    
    // Producer paused
    this.socket.on('producerPaused', (data) => {
      this.log('Producer paused:', data);
      
      if (this.onProducerStateChanged) {
        this.onProducerStateChanged({
          peerId: data.peerId,
          mediaType: data.mediaType,
          state: 'paused'
        });
      }
    });
    
    // Producer resumed
    this.socket.on('producerResumed', (data) => {
      this.log('Producer resumed:', data);
      
      if (this.onProducerStateChanged) {
        this.onProducerStateChanged({
          peerId: data.peerId,
          mediaType: data.mediaType,
          state: 'resumed'
        });
      }
    });
    
    // Producer closed
    this.socket.on('producerClosed', (data) => {
      this.log('Producer closed:', data);
      
      if (this.onProducerStateChanged) {
        this.onProducerStateChanged({
          peerId: data.peerId,
          mediaType: data.mediaType,
          state: 'closed'
        });
      }
    });
    
    // Chat message
    this.socket.on('chatMessage', (message) => {
      this.log('Chat message:', message);
      
      if (this.onChatMessage) {
        this.onChatMessage(message);
      }
    });

    // Get router RTP capabilities
    this.socket.on('getRouterRtpCapabilities', async ({ roomId }, callback) => {
      try {
        const room = await this.getOrCreateRoom(roomId);
        if (!room || !room.router) {
          throw new Error('Room or router not found');
        }
        callback({ rtpCapabilities: room.router.rtpCapabilities });
      } catch (error) {
        this.error('Error getting router capabilities:', error);
        callback({ error: error.message });
      }
    });

    // Consume (receive media)
    this.socket.on('consume', async ({ roomId, producerId, rtpCapabilities }, callback) => {
      try {
        const room = this.rooms.get(roomId);
        if (!room) {
          throw new Error(`Room ${roomId} not found`);
        }
        
        // Validate RTP capabilities
        if (!rtpCapabilities || typeof rtpCapabilities !== 'object') {
          throw new Error('Invalid RTP capabilities');
        }

        // Check if consumer can consume the producer
        if (!room.router.canConsume({
          producerId,
          rtpCapabilities
        })) {
          throw new Error(`Cannot consume producer ${producerId}`);
        }
        
        const consumer = await room.createConsumer(this.userId, producerId);
        callback(consumer);
      } catch (error) {
        this.error('Error consuming:', error);
        callback({ error: error.message });
      }
    });

    // Join a meeting room
    this.socket.on('joinRoom', async ({ roomId, userName: customUserName, userRole: customUserRole }, callback) => {
      try {
        // Use custom values if provided, otherwise fallback to socket values
        const name = customUserName || this.userName || 'Anonymous';
        const role = customUserRole || this.userRole || 'learner';
        
        this.log(`User ${name} (${this.userId}) joining room ${roomId} as ${role}`);
        
        // Update socket user data with custom values if provided
        if (customUserName) this.socket.userName = customUserName;
        if (customUserRole) this.socket.userRole = customUserRole;
        
        const room = await this.getOrCreateRoom(roomId);
        
        // Add peer to room with RTP capabilities
        room.addPeer(this.userId, {
          id: this.userId,
          name,
          role,
          socketId: this.socket.id,
          rtpCapabilities: null // Will be set later when device is loaded
        });
        
        // Join socket.io room
        this.socket.join(roomId);
        this.socketRooms.set(roomId, room);
        
        // Get all peers (including the one joining)
        const peers = room.getPeers();
        
        // Get all active producers
        const producers = room.getProducerListForPeer();
        
        // Notify other users in the room
        this.socket.to(roomId).emit('userJoined', { 
          peerId: this.userId, 
          peerName: name,
          role
        });
        
        callback({ 
          peers, 
          producers,
          joined: true 
        });
      } catch (error) {
        this.error('Error joining room:', error);
        callback({ error: error.message });
      }
    });
  }
  
  async joinRoom(roomId, userInfo = {}) {
    try {
      if (!this.userId) {
        throw new Error('Peer ID not available. Make sure you are connected to the server.');
      }

      // Update user info if provided
      if (userInfo.name) this.userName = userInfo.name;
      if (userInfo.role) this.userRole = userInfo.role;
      
      this.log(`Joining room ${roomId} as ${this.userName} (${this.userId}), Role: ${this.userRole}`);
      
      // 1. Get router RTP capabilities
      const { rtpCapabilities, error: rtpError } = await this.request('getRouterRtpCapabilities', { 
        roomId 
      });
      
      if (rtpError) {
        throw new Error(rtpError);
      }
      
      // 2. Initialize mediasoup device with proper error handling
      try {
      this.device = new mediasoupClient.Device();
      await this.device.load({ routerRtpCapabilities: rtpCapabilities });
        this.log('Device loaded with RTP capabilities:', {
          loaded: this.device.loaded,
          canProduce: this.device.canProduce('video'),
          rtpCapabilities: this.device.rtpCapabilities
        });
      } catch (error) {
        this.error('Failed to load mediasoup device:', error);
        throw new Error(`Failed to initialize mediasoup device: ${error.message}`);
      }
      
      // 3. Join room through signaling
      const { peers, producers, joined, peerId, error } = await this.request('joinRoom', { 
        roomId,
        userName: this.userName,
        userRole: this.userRole,
        rtpCapabilities: this.device.rtpCapabilities
      });
      
      if (error) {
        throw new Error(error);
      }

      // Update peer ID if server assigns a new one
      if (peerId && peerId !== this.userId) {
        this.log(`Server assigned new peer ID: ${peerId} (was: ${this.userId})`);
        this.userId = peerId;
      }
      
      this.roomId = roomId;
      
      // 4. Create transports
      await this.createTransports(roomId);
      
      // 5. Process existing peers first
      if (peers && peers.length > 0) {
        this.log(`Room ${roomId} has ${peers.length} peers:`);
        peers.forEach(peer => {
          if (peer.id !== this.userId) {
            this.log(`- ${peer.name} (${peer.id}), Role: ${peer.role || 'unknown'}`);
            this.peers.set(peer.id, {
              id: peer.id,
              name: peer.name,
              role: peer.role,
              consumers: []
            });
          }
        });
      }
      
      // 6. Process existing producers
      if (producers && producers.length > 0) {
        this.log(`Room ${roomId} has ${producers.length} active producers:`);
        for (const producer of producers) {
          this.log(`- Producer ${producer.producerId} (${producer.kind}) from peer ${producer.peerId}`);
          try {
            const consumer = await this.consume(producer.producerId);
            if (consumer) {
              // Get the peer and update its consumers
              const peer = this.peers.get(producer.peerId);
              if (peer) {
                const consumerData = {
                  id: consumer.id,
                  mediaType: producer.kind,
                  track: consumer.track
                };
                peer.consumers.push(consumerData);
                this.log(`Added consumer to peer ${peer.name}:`, consumerData);

                // Notify about new consumer
                if (this.onNewConsumer) {
                  this.onNewConsumer({
                    peerId: producer.peerId,
                    peerName: peer.name,
                    consumerId: consumer.id,
                    mediaType: producer.kind,
                    kind: consumer.kind,
                    track: consumer.track
                  });
                }
              }
            }
          } catch (error) {
            this.error(`Failed to consume producer ${producer.producerId}:`, error);
        }
        }
      } else {
        this.log('No existing producers in room');
      }
      
      return { joined, peers };
    } catch (error) {
      this.error('Error joining room:', error);
      throw error;
    }
  }
  
  async initializeMediasoup(roomId) {
    try {
      // 1. Get router RTP capabilities
      const { rtpCapabilities } = await this.request('getRouterRtpCapabilities', { roomId });
      
      // 2. Create Device
      this.device = new mediasoupClient.Device();
      
      // 3. Load the device with router's rtpCapabilities
      await this.device.load({ routerRtpCapabilities: rtpCapabilities });
      
      return true;
    } catch (error) {
      this.error('Error initializing mediasoup:', error);
      throw error;
    }
  }
  
  async createTransports(roomId) {
    try {
      this.log('Creating WebRTC transports for room:', roomId);

      // Fetch TURN server credentials
      const turnResponse = await fetch(`${process.env.REACT_APP_BACKEND}/turn/token`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!turnResponse.ok) {
        throw new Error('Failed to get TURN credentials');
      }

      const { iceServers } = await turnResponse.json();
      this.log('Received ICE servers:', iceServers);

      // Create producer transport
      const producerTransportInfo = await this.request('createWebRtcTransport', {
        roomId,
        type: 'producer'
      });
      
      this.log('Producer transport info received:', producerTransportInfo);
      
      this.producerTransport = this.device.createSendTransport({
        id: producerTransportInfo.id,
        iceParameters: producerTransportInfo.iceParameters,
        iceCandidates: producerTransportInfo.iceCandidates,
        dtlsParameters: producerTransportInfo.dtlsParameters,
        iceServers: iceServers // Add TURN servers here
      });
      
      // Create consumer transport
      const consumerTransportInfo = await this.request('createWebRtcTransport', {
        roomId,
        type: 'consumer'
      });
      
      this.log('Consumer transport info received:', consumerTransportInfo);

      this.consumerTransport = this.device.createRecvTransport({
        id: consumerTransportInfo.id,
        iceParameters: consumerTransportInfo.iceParameters,
        iceCandidates: consumerTransportInfo.iceCandidates,
        dtlsParameters: consumerTransportInfo.dtlsParameters,
        iceServers: iceServers // Add TURN servers here
      });

      // Set up transport event handlers
      this.setupTransportHandlers();

      this.log('Transports created successfully');
      return true;
    } catch (error) {
      this.error('Error creating transports:', error);
      throw error;
    }
  }
  
  setupTransportHandlers() {
    // Producer transport events
      this.producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
        this.log('Producer transport connect event');
          await this.request('connectTransport', {
          roomId: this.roomId,
            transportId: this.producerTransport.id,
            dtlsParameters,
            type: 'producer'
          });
          callback();
        } catch (error) {
        this.error('Producer transport connect error:', error);
          errback(error);
        }
      });
      
      this.producerTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
        this.log('Producer transport produce event:', { kind, appData });
          const { id } = await this.request('produce', {
          roomId: this.roomId,
            transportId: this.producerTransport.id,
            kind,
            rtpParameters,
            mediaType: appData.mediaType
          });
          callback({ id });
        } catch (error) {
        this.error('Producer transport produce error:', error);
          errback(error);
        }
      });
      
    // Consumer transport events
      this.consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
        this.log('Consumer transport connect event');
          await this.request('connectTransport', {
          roomId: this.roomId,
            transportId: this.consumerTransport.id,
            dtlsParameters,
            type: 'consumer'
          });
          callback();
        } catch (error) {
        this.error('Consumer transport connect error:', error);
          errback(error);
        }
      });
  }
  
  async produce(track, mediaType = 'video') {
    try {
      if (!this.producerTransport) {
        throw new Error('Producer transport not created');
      }
      
      this.log('=== PRODUCING MEDIA ===');
      this.log('Media Type:', mediaType);
      this.log('Track:', track);
      this.log('Track Settings:', track.getSettings());
      this.log('Track Constraints:', track.getConstraints());
      this.log('User ID:', this.userId);
      this.log('Room ID:', this.roomId);
      
      const producer = await this.producerTransport.produce({
        track,
        encodings: this.getEncodings(mediaType),
        codecOptions: this.getCodecOptions(mediaType),
        appData: { mediaType, peerId: this.userId }
      });
      
      this.producers.set(mediaType, producer);
      this.log('Producer created successfully:', {
        id: producer.id,
        mediaType: mediaType,
        paused: producer.paused,
        closed: producer.closed
      });
      
      // Handle producer events
      producer.on('transportclose', () => {
        this.log(`Producer ${producer.id} transport closed`);
        this.producers.delete(mediaType);
        if (mediaType === 'audio') this.audioProducers.delete(this.userId);
        if (mediaType === 'video') this.videoProducers.delete(this.userId);
        if (mediaType === 'screen') this.screenProducers.delete(this.userId);
      });
      
      producer.on('trackended', () => {
        this.log(`Producer ${producer.id} track ended`);
        this.closeProducer(mediaType);
      });

      // Store in type-specific maps and emit event
      try {
        if (mediaType === 'audio') {
          this.log('Storing audio producer');
          this.audioProducers.set(this.userId, producer);
        } else if (mediaType === 'video') {
          this.log('Storing video producer');
          this.videoProducers.set(this.userId, producer);
        } else if (mediaType === 'screen') {
          this.log('Storing screen producer');
          this.screenProducers.set(this.userId, producer);
        }
        this.log(`Successfully stored ${mediaType} producer for peer ${this.userId}`);

        // Emit event to notify server about new producer
        this.socket.emit('producerCreated', {
          producerId: producer.id,
          mediaType: mediaType,
          userId: this.userId,
          roomId: this.roomId
        });
      } catch (error) {
        this.error(`Error storing ${mediaType} producer:`, error);
      }
      
      return producer;
    } catch (error) {
      this.error('Error producing media:', error);
      throw error;
    }
  }
  
  async consume(producerId) {
    try {
      if (!this.consumerTransport) {
        throw new Error('Consumer transport not created');
      }
      
      if (!this.device || !this.device.loaded) {
        throw new Error('Device not loaded');
      }

      this.log('=== CONSUMING PRODUCER ===');
      this.log('Producer ID:', producerId);
      this.log('Consumer Transport State:', {
        id: this.consumerTransport.id,
        connectionState: this.consumerTransport.connectionState,
        appData: this.consumerTransport.appData
      });

      // Get consume response from server
      const consumeResponse = await this.request('consume', {
          roomId: this.roomId,
          producerId,
        rtpCapabilities: this.device.rtpCapabilities
      });

      if (consumeResponse.error) {
        throw new Error(consumeResponse.error);
      }

      const { id, kind, rtpParameters, type, producerPeerId } = consumeResponse;

      // Verify we can consume this producer
      if (!this.device.rtpCapabilities || !rtpParameters) {
        throw new Error('Invalid RTP parameters or capabilities');
      }

      // Create the consumer
      const consumer = await this.consumerTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
        appData: { producerPeerId, mediaType: type }
      });
      
      this.log('Consumer created:', {
        id: consumer.id,
        kind: consumer.kind,
        track: consumer.track ? {
          kind: consumer.track.kind,
          enabled: consumer.track.enabled,
          muted: consumer.track.muted,
          readyState: consumer.track.readyState
        } : 'missing',
        paused: consumer.paused,
        producerPaused: consumer.producerPaused
      });

      // Store the consumer
      this.consumers.set(consumer.id, consumer);

      // Add to peer's consumers if peer exists
      const peer = this.peers.get(producerPeerId);
      if (peer) {
        this.log('Adding consumer to existing peer:', {
          peerId: producerPeerId,
          peerName: peer.name,
          consumerType: type
        });
        const consumerData = {
          id: consumer.id,
          mediaType: type,
          track: consumer.track
        };
        peer.consumers.push(consumerData);
        this.log('Added consumer to peer:', consumerData);
      } else {
        this.log('Peer not found, storing as pending consumer:', {
          producerPeerId,
          consumerType: type
        });
        let pendingConsumers = this.pendingConsumers.get(producerPeerId);
        if (!pendingConsumers) {
          pendingConsumers = [];
          this.pendingConsumers.set(producerPeerId, pendingConsumers);
        }
        const consumerData = {
          id: consumer.id,
          mediaType: type,
          track: consumer.track
        };
        pendingConsumers.push(consumerData);
        this.log('Added to pending consumers:', consumerData);
      }

      // Resume the consumer
      try {
        await this.resumeConsumer(consumer.id);
        this.log(`Consumer ${consumer.id} resumed successfully`);
      } catch (error) {
        this.error(`Error resuming consumer ${consumer.id}:`, error);
      }
      
      return consumer;
    } catch (error) {
      this.error('Error in consume():', error);
      throw error;
    }
  }
  
  async resumeConsumer(consumerId) {
    try {
      await this.request('resumeConsumer', {
        roomId: this.roomId,
        consumerId
      });
      
      return true;
    } catch (error) {
      this.error('Error resuming consumer:', error);
      throw error;
    }
  }
  
  async pauseProducer(mediaType) {
    try {
      await this.request('pauseProducer', {
        roomId: this.roomId,
        mediaType
      });
      
      return true;
    } catch (error) {
      this.error(`Error pausing ${mediaType} producer:`, error);
      throw error;
    }
  }
  
  async resumeProducer(mediaType) {
    try {
      await this.request('resumeProducer', {
        roomId: this.roomId,
        mediaType
      });
      
      return true;
    } catch (error) {
      this.error(`Error resuming ${mediaType} producer:`, error);
      throw error;
    }
  }
  
  async closeProducer(mediaType) {
    try {
      const producer = this.producers.get(mediaType);
      if (!producer) return;
      
      this.producers.delete(mediaType);
      
      await this.request('closeProducer', {
        roomId: this.roomId,
        mediaType
      });
      
      producer.close();
      
      return true;
    } catch (error) {
      this.error(`Error closing ${mediaType} producer:`, error);
      throw error;
    }
  }
  
  async startCamera() {
    try {
      this.log('=== STARTING CAMERA ===');
      this.log('User Role:', this.userRole);

      // Request media devices for all users
        this.log('Requesting media devices');
        
        const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
        this.log('Media stream obtained:', {
          tracks: stream.getTracks().map(t => ({
            kind: t.kind,
            enabled: t.enabled,
            muted: t.muted,
            readyState: t.readyState
          }))
        });

        this.localStream = stream;
      
      // Produce video
        const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
          this.log('Producing video track:', {
            enabled: videoTrack.enabled,
            muted: videoTrack.muted,
            settings: videoTrack.getSettings()
          });
        await this.produce(videoTrack, 'video');
      }
      
      // Produce audio
        const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
          this.log('Producing audio track:', {
            enabled: audioTrack.enabled,
            muted: audioTrack.muted,
            settings: audioTrack.getSettings()
          });
        await this.produce(audioTrack, 'audio');
      }
      
        return stream;
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
        this.log('Media access denied or device busy:', error);
        return null;
      }
      this.error('Error starting camera:', error);
      throw error;
    }
  }
  
  async startScreenSharing() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });
      
      const screenTrack = this.screenStream.getVideoTracks()[0];
      
      if (!screenTrack) {
        throw new Error('No screen track available');
      }
      
      screenTrack.onended = async () => {
        this.log('Screen sharing ended by browser UI');
        await this.stopScreenSharing();
      };
      
      // Produce screen
      await this.produce(screenTrack, 'screen');
      
      return this.screenStream;
    } catch (error) {
      this.error('Error starting screen sharing:', error);
      
      // Enhance error messages for common screen sharing issues
      if (error.name === 'NotAllowedError') {
        throw new Error('Permission denied: You need to allow screen sharing access');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Could not start screen sharing: Your screen contents are not readable');
      } else if (error.name === 'AbortError') {
        throw new Error('Screen sharing was cancelled');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No screen available to share');
      }
      
      throw error;
    }
  }
  
  async stopScreenSharing() {
    try {
      await this.closeProducer('screen');
      
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }
      
      return true;
    } catch (error) {
      this.error('Error stopping screen sharing:', error);
      throw error;
    }
  }
  
  async toggleCamera(enabled) {
    try {
      if (enabled) {
        await this.resumeProducer('video');
      } else {
        await this.pauseProducer('video');
      }
      
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
      
      return true;
    } catch (error) {
      this.error('Error toggling camera:', error);
      throw error;
    }
  }
  
  async toggleMicrophone(enabled) {
    try {
      if (enabled) {
        await this.resumeProducer('audio');
      } else {
        await this.pauseProducer('audio');
      }
      
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
      
      return true;
    } catch (error) {
      this.error('Error toggling microphone:', error);
      throw error;
    }
  }
  
  async sendChatMessage(message) {
    if (!this.socket || !this.isConnected || !this.roomId) {
      throw new Error('Not connected to room');
    }
    
    this.log(`Sending chat message as ${this.userName || 'unknown'} (${this.userId || 'unknown ID'})`);
    
    // Use the user information received from connection_ack event
    const chatMessage = {
      roomId: this.roomId,
      message: message,
      // These aren't strictly necessary as the server will use its stored values,
      // but including them improves reliability in case server doesn't have them
      userId: this.userId,
      userName: this.userName
    };
    
    this.socket.emit('sendMessage', chatMessage);
  }
  
  async endMeeting(roomId) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server');
    }
    
    return this.request('endMeeting', { roomId });
  }
  
  async leaveRoom() {
    try {
      // Close all producers
      for (const [mediaType, producer] of this.producers.entries()) {
        producer.close();
        this.producers.delete(mediaType);
      }
      
      // Close all consumers
      for (const [consumerId, consumer] of this.consumers.entries()) {
        consumer.close();
        this.consumers.delete(consumerId);
      }
      
      // Close transports
      if (this.producerTransport) {
        this.producerTransport.close();
        this.producerTransport = null;
      }
      
      if (this.consumerTransport) {
        this.consumerTransport.close();
        this.consumerTransport = null;
      }
      
      // Stop local streams
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }
      
      // Leave room via signaling
      await this.request('leaveRoom', { roomId: this.roomId });
      
      // Clear data
      this.roomId = null;
      this.peers.clear();
      
      return true;
    } catch (error) {
      this.error('Error leaving room:', error);
      throw error;
    }
  }
  
  async disconnect() {
    try {
      if (this.roomId) {
        await this.leaveRoom();
      }
      
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      this.isConnected = false;
      
      return true;
    } catch (error) {
      this.error('Error disconnecting:', error);
      throw error;
    }
  }
  
  async request(method, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      
      this.socket.emit(method, data, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  getEncodings(mediaType) {
    if (mediaType === 'screen') {
      return [
        {
          maxBitrate: 5000000,
          scalabilityMode: 'L1T3'
        }
      ];
    }
    
    if (mediaType === 'video') {
      return [
        {
          maxBitrate: 500000,
          scalabilityMode: 'L1T3'
        }
      ];
    }
    
    return undefined;
  }
  
  getCodecOptions(mediaType) {
    if (mediaType === 'video' || mediaType === 'screen') {
      return {
        videoGoogleStartBitrate: 1000
      };
    }
    
    return undefined;
  }
}

export default MediasoupClient; 