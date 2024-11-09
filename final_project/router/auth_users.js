const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Sample users array
let users = [
  { username: "john_doe", password: "securePassword123" }
]; 

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Incorrect password." });
  }

  // Create JWT token
  const token = jwt.sign({ username }, 'access', { expiresIn: '1h' });

  // Store the token in the session
  req.session.token = token;
  console.log("Token set in session:", req.session.token); // Check if token is saved

  return res.status(200).json({
    message: "Login successful.",
    token: token
  });
});

// Add or Modify a book review route
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  
  // Check if the review exists
  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Get the book based on ISBN
  const book = books[isbn];

  // Add or modify the review for the book
  book.reviews[req.user.username] = review; // Save review by the logged-in user

  return res.status(200).json({
    message: "Review added/modified successfully.",
    book: book
  });
});

// Authentication middleware for routes that require login
regd_users.use("/auth/*", (req, res, next) => {
  const token = req.session.token; // Retrieve token from session

  console.log("Session token in auth middleware: ", token);  // Log the token for debugging

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Verify token
  jwt.verify(token, "access", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    } else {
      req.user = decoded;  // Store decoded token info in req.user
      next();  // Proceed to the next middleware/route
    }
  });
});

// Delete a book review route
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;  // Get ISBN from the route parameters
  const { review } = req.body;  // Get review from the request body (optional for additional validation)

  // Ensure user is authenticated and token is verified
  if (!req.user) {
    return res.status(401).json({ message: "User is not authenticated." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the logged-in user has a review for the book
  if (!books[isbn].reviews[req.user.username]) {
    return res.status(400).json({ message: "Review not found for this user." });
  }

  // Delete the review by the logged-in user
  delete books[isbn].reviews[req.user.username];

  return res.status(200).json({
    message: "Review deleted successfully."
  });
});

// Delete a book review route
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;  // Get ISBN from the route parameters

  // Ensure user is authenticated and token is verified
  if (!req.user) {
    return res.status(401).json({ message: "User is not authenticated." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the logged-in user has a review for the book
  if (!books[isbn].reviews[req.user.username]) {
    return res.status(400).json({ message: "Review not found for this user." });
  }

  // Delete the review by the logged-in user
  delete books[isbn].reviews[req.user.username];

  // Send success response
  return res.status(200).json({
    message: "Review deleted successfully."
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;