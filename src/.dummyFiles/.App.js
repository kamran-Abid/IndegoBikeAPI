const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

require('./src/DbConn.js');

const app = express();
const port = 3000;

// Create a schema for storing Indego station data
const IndegoStationSchema = new mongoose.Schema({
    timestamp: Date,
    data: Object,
  });
  const IndegoStation = mongoose.model('IndegoStation', IndegoStationSchema);

  // Store data from Indego

  
// Store data from Indego
const fetchDataAndStore = async () => {
    try {
      const response = await axios.get('https://www.rideindego.com/stations/json/');
      const data = response.data;
  
      const indegoStation = new IndegoStation({
        timestamp: new Date(),
        data: data,
      });
      await indegoStation.save();

      console.log('Data stored successfully', new Date());
    } catch (error) {
      console.error('Error storing Indego data:', error);
    }
};

// Start fetching and storing data at intervals
const interval = 60000; // 30 minutes 30 * 60 * 1000
setInterval(fetchDataAndStore, interval);

app.post('/api/v1/indego-data-fetch-and-store-it-db', async (req, res) => {
    try {
      const response = await axios.get('https://www.rideindego.com/stations/json/');
      const data = response.data;
  
      const indegoStation = new IndegoStation({
        timestamp: new Date(),
        data: data,
      });
  
      await indegoStation.save();
      console.log(indegoStation);
  
      res.status(200).json({ message: 'Data stored successfully' });
    } catch (error) {
      console.error('Error storing Indego data:', error);
      res.status(500).json({ message: 'Error storing Indego data' });
    }
  });
  
  // Get snapshot of all stations at a specified time
  app.get('/api/v1/stations', async (req, res) => {
    const requestedTime = new Date().toISOString();  // req.query.at
    // Create a new Date object to get the current date and time
    // const requestedTime = requestedTime1.toISOString();;
    console.log(requestedTime);
  
    try {
      const snapshot = await IndegoStation.findOne({ timestamp: { $lte: requestedTime } }).sort('timestamp');
  
      if (!snapshot) {
        res.status(404).json({ message: 'Data not found' });
        return;
      }
  
      // Get weather data
      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: 'Philadelphia',
          appid: 'edffca162a1073ea0d1ab9ec3fdfb97f',
        },
      });
      const weatherData = weatherResponse.data;
  
      res.status(200).json({
        at: snapshot.timestamp,
        stations: snapshot.data,
        weather: weatherData,
      });
    } catch (error) {
      console.error('Error retrieving snapshot:', error);
      res.status(500).json({ message: 'Error retrieving snapshot' });
    }
  });
  
// Get snapshot of one station at a specific time
app.get('/api/v1/stations/:kioskId', async (req, res) => {
    const kioskId = req.params.kioskId;
    const requestedTime = new Date(req.query.at);
  
    try {
      const snapshot = await IndegoStation.findOne({
        timestamp: { $gte: requestedTime },
        'data.features.properties.kioskId': kioskId,
      }).sort('timestamp');
  
      if (!snapshot) {
        res.status(404).json({ message: 'Data not found' });
        return;
      }
  
      // Get weather data
      const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: 'Philadelphia',
          appid: 'edffca162a1073ea0d1ab9ec3fdfb97f',
        },
      });
      const weatherData = weatherResponse.data;
  
      // Find the specific station in the snapshot data
      const stationData = snapshot.data.features.find((feature) => feature.properties.kioskId === kioskId);
  
      res.status(200).json({
        at: snapshot.timestamp,
        station: stationData,
        weather: weatherData,
      });
    } catch (error) {
        console.error('Error retrieving snapshot:', error);
        res.status(500).json({ message: 'Error retrieving snapshot' });
      }
    });
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });