const express = require('express');

const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const router = require('./routes/router');

// Read environment variables from .env
const dotenv = require('dotenv');
dotenv.config();

// DB setup
const { MONGO_DB_USER, MONGO_DB_PASSWORD } = process.env;
const MONGO_URL = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PASSWORD}@cluster0.3l6s1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
mongoose.connect(MONGO_URL, { useNewUrlParser: true });

// App setup
app.use(morgan('tiny'));
app.use(cors());

app.use((req, res, next) => {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
   res.setHeader('Access-Control-Allow-Credentials', true);

   // Pass to next layer of middleware
   next();
});

app.use(bodyParser.json());

router(app);


// Server setup
const port = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(port, () => {
  console.log('Listening on port: ', port);
});

