const JWT = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Extract the JWT token from the 'access_token' header in the request
  const token = req.headers['access_token'];

  // Check if a token is present in the request headers
  if (!token) {
    // If no token is provided, respond with an error message
    res.send("You are not allowed");
    return; // Exit the middleware
  }

  // Verify the JWT token using the secret from the environment variables (process.env.JWT)
  JWT.verify(token, process.env.JWT, (err, data) => {
    if (err) {
      // If verification fails, respond with an error message
      res.send("Error occurred");
      return; // Exit the middleware
    } else {
      // If verification is successful, attach the decoded data to the request object
      req.data = data;
      next(); // Continue to the next middleware or route
    }
  });
};


module.exports = verifyToken;
