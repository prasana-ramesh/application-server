// Include our packages in our main server file
const express = require('express');
app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const config = require('./config/main');
const neo4j = require('neo4j-driver').v1;
const cors = require('cors');
const port = 3001;

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {
  res.send('Cannot stat home directory. Nothing on /api/');
});

// Connect to database
const mongodb_conn = 'mongodb://' + config.database.mongodb.username + ':' +
                                    config.database.mongodb.passphrase + '@' +
                                    config.database.mongodb.host + ':' +
                                    config.database.mongodb.port + '/' +
                                    config.database.mongodb.dbname;
mongoose.connect(mongodb_conn);

const neo4j_conn = 'bolt://' + config.database.neo4j.host;
const driver = neo4j.driver(neo4j_conn, neo4j.auth.basic(config.database.neo4j.username, config.database.neo4j.passphrase));
app.set('neo4jsession', driver.session);

require('./app/routes')(app);

// Start the server
app.listen(port);
console.log('Your server is running on port ' + port + '.');
