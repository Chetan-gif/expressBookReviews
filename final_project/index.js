const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

//app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  }));  
  
// Authentication middleware for routes that require login
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.session.token; // Retrieve token from session
  
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
  
    // Verify token
    jwt.verify(token, "access", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token." });
      } else {
        req.user = decoded; // Store decoded token information
        next();
      }
    });
  });  
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
