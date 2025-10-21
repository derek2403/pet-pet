const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  // Store connected devices and their locations
  const devices = new Map();
  
  // Store pet activity data
  const petActivities = new Map();
  const activityHistory = [];
  const MAX_HISTORY = 1000;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle pet activity updates
    socket.on('pet-activity', (data) => {
      const activityData = {
        id: socket.id,
        petName: data.petName,
        activity: data.activity,
        confidence: data.confidence,
        movement: data.movement,
        timestamp: data.timestamp,
        position: data.position,
      };

      petActivities.set(socket.id, activityData);
      
      // Add to history
      activityHistory.push(activityData);
      if (activityHistory.length > MAX_HISTORY) {
        activityHistory.shift();
      }
      
      // Broadcast to all dashboard clients
      io.emit('pet-activities-update', {
        current: Array.from(petActivities.values()),
        history: activityHistory.slice(-100), // Send last 100 activities
      });
      
      console.log(`Activity from ${data.petName}: ${data.activity} (${(data.confidence * 100).toFixed(0)}%)`);
    });

    // Send current pet activities to newly connected dashboard
    socket.on('request-pet-activities', () => {
      socket.emit('pet-activities-update', {
        current: Array.from(petActivities.values()),
        history: activityHistory.slice(-100),
      });
    });

    // Handle phone location updates
    socket.on('location-update', (data) => {
      const deviceInfo = {
        id: socket.id,
        name: data.name || `Device ${socket.id.slice(0, 6)}`,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp,
        heading: data.heading,
        speed: data.speed,
      };

      devices.set(socket.id, deviceInfo);
      
      // Broadcast to all dashboard clients
      io.emit('devices-update', Array.from(devices.values()));
      
      console.log(`Location update from ${deviceInfo.name}:`, {
        lat: data.latitude,
        lng: data.longitude,
      });
    });

    // Send current devices to newly connected dashboard
    socket.on('request-devices', () => {
      socket.emit('devices-update', Array.from(devices.values()));
    });

    // Handle device name update
    socket.on('update-name', (name) => {
      const device = devices.get(socket.id);
      if (device) {
        device.name = name;
        io.emit('devices-update', Array.from(devices.values()));
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      devices.delete(socket.id);
      petActivities.delete(socket.id);
      io.emit('devices-update', Array.from(devices.values()));
      io.emit('pet-activities-update', {
        current: Array.from(petActivities.values()),
        history: activityHistory.slice(-100),
      });
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running`);
    });
});

