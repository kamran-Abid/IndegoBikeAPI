const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('./src/DbConn.js');

const app = express();
const port = 3000;
// Parse JSON requests
app.use(bodyParser.json());

// Create a schema for storing Indego station data
const IndegoStationSchema = new mongoose.Schema({
    timestamp: Date,
    IndegoData: Object,
    WeatherData: Object
});
const IndegoStation = mongoose.model('IndegoStation', IndegoStationSchema);

// Fetch and store data

const fetchDataAndStore = async () => {

    try {

        // get indego response 

        const i_response = await axios.get('https://www.rideindego.com/stations/json/');
        const i_data = i_response.data;

        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: 'Philadelphia',
                appid: 'edffca162a1073ea0d1ab9ec3fdfb97f',
            },
        });
        const weatherData = weatherResponse.data;

        const indegoStation = new IndegoStation({
            timestamp: new Date(),
            IndegoData: i_data,
            WeatherData: weatherData
        });
        await indegoStation.save();
        
        // Make a POST request to the external API
        const response = await axios.post('http://localhost:3000/api/v1/indego-data-fetch-and-store-it-db', {
            // Add required request payload here
        });
        // Create a new document in the MongoDB collection
        const newData = new Model({
            data: response.data,
        });
        await newData.save();

        console.log('Data stored successfully', new Date());
    } catch (error) {
        console.error('Error storing Indego data:', error);
    }
};

/* ================ * * * ================
Start fetching and storing data at intervals
================ * * * ================  */


const interval = 60 * 60 * 1000; // data save after every 1 hour \\ 30 * 60 * 1000
setInterval(fetchDataAndStore, interval);


// Get snapshot of all stations at a specified time
app.get('/api/v1/stations', async (req, res) => {
    const requestedTime = new Date().toISOString();

    try {
        //const snapshot = await IndegoStation.findOne({ timestamp: { $lte: requestedTime } }).sort('timestamp');
        const snapshot = await IndegoStation.findOne({ timestamp: { $lte: requestedTime } }).sort('timestamp');

        if (!snapshot) {
            res.status(404).json({ message: 'Data not found' });
            return;
        }

        res.status(200).json({
            at: snapshot.timestamp,
            stations: snapshot.IndegoData,
            Weather: snapshot.WeatherData
        });
    } catch (error) {
        console.error('Error retrieving snapshot:', error);
        res.status(500).json({ message: 'Error retrieving snapshot' });
    }
});


/* ================= * ====================== 
    Get snapshot of one station at a specific time  
   ================= * ======================  */

 
app.get('/api/v1/stations/:kioskId', async (req, res) => {
    const kioskId = req.params.kioskId;
    const requestedTime = new Date().toISOString();
  
    try {
      const snapshot = await IndegoStation.findOne({
        timestamp: { $lte: requestedTime },
        'IndegoData.features.properties.kioskId': kioskId,
      }).sort('timestamp');
      console.log(snapshot);   //  'station.features.properties.kioskId': kioskId,
  
      if (!snapshot) {
        res.status(404).json({ message: 'Data not found' });
        return;
      }
  
      
  
      // Find the specific station in the snapshot data
      // res.json(snapshot);
      //const stationData = snapshot.data.features.find((feature) => feature.properties.kioskId === kioskId);
  
      res.status(200).json({
        at: snapshot.timestamp,
        station: snapshot.IndegoData,
        weather: snapshot.WeatherData,
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


