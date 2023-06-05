# IndegoBikeAPI

This is Node.js API.

Follow these steps to run API
1 Download and extract the project ZIP file.
2 Type npm i (make sure node is installed).
3 nodemon should be install grobally.
4 Type npm run dev and application will be live at 'http://localhost:3000'
5 Make sure MongoDb is installed and running at 'mongodb://localhost:27017'
6 After 1 hour it post data on server and save data in localhost database MongoDB.
7 Hit this url "http://localhost:3000/api/v1/stations/" for get request and you will get all records from db in response.
8 Hit this url "http://localhost:3000/api/v1/stations/:id" for get request and you will get specific records from db in response (replace :id with id you want to get).
