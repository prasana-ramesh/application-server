// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Load models
const User = require('./models/user');
const Chat = require('./models/chat');

// Export the routes for our app to use
module.exports = function(app) {
  // API Route Section

  // Initialize passport for use
  app.use(passport.initialize());

  // Bring in defined Passport Strategy
  require('../config/passport')(passport);

  // Create API group routes
  const apiRoutes = express.Router();

  // Protect chat routes with JWT
  // GET messages for authenticated user
  apiRoutes.get('/chat', requireAuth, function(req, res) {
    Chat.find({$or : [{'to': req.user._id}, {'from': req.user._id}]}, function(err, messages) {
      if (err)
        res.status(400).send(err);

      res.status(400).json(messages);
    });
  });

  // POST to create a new message from the authenticated user
  apiRoutes.post('/chat', requireAuth, function(req, res) {
    const chat = new Chat();
        chat.from = req.user._id;
        chat.to = req.body.to;
        chat.message_body = req.body.message_body;

        // Save the chat message if there are no errors
        chat.save(function(err) {
            if (err)
                res.status(400).send(err);

            res.status(201).json({ message: 'Message sent!' });
        });
  });

  // PUT to update a message the authenticated user sent
  apiRoutes.put('/chat/:message_id', requireAuth, function(req, res) {
    Chat.findOne({$and : [{'_id': req.params.message_id}, {'from': req.user._id}]}, function(err, message) {
      if (err)
        res.send(err);

      message.message_body = req.body.message_body;

      // Save the updates to the message
      message.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'Message edited!' });
      });
    });
  });
  
  //GET Test for Authenticated user
  apiRoutes.get('/getUserId', requireAuth, function(req, res) {
	res.json({ userId: req.user._id, email: req.user.email });
  });  

  
  // DELETE a message
  apiRoutes.delete('/chat/:message_id', requireAuth, function(req, res) {
    Chat.findOneAndRemove({$and : [{'_id': req.params.message_id}, {'from': req.user._id}]}, function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'Message removed!' });
    });
  });

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
