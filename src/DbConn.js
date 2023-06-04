const mongoose = require('mongoose');

mongoose.set("strictQuery", false);
 
// mongosh "mongodb://mongo:VO9D8L4ndMs93LrHndWT@containers-us-west-121.railway.app:6040"  mongodb://127.0.0.1:27017

mongoose.connect('mongodb://127.0.0.1:27017/indego-weather',{
}).then(() => console.log("Database connected successfully"))
.catch(e => console.log(`Error in database connection :\n ${e} `))