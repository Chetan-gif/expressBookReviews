const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// POST /register: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  
  // Check if user already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "User already exists." });
  }

  // Add new user to the users array
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully!" });
});

// GET /: Get the list of all books
public_users.get('/', async function (req, res) {
  try {
    const booksList = await new Promise((resolve) => {
      resolve(books); // Resolve the books data asynchronously
    });
    res.status(200).json({ books: booksList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// GET /isbn/:isbn: Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const { isbn } = req.params;
  try {
    const book = await new Promise((resolve, reject) => {
      const foundBook = Object.values(books).find(book => book.isbn === isbn);
      if (foundBook) {
        resolve(foundBook);
      } else {
        reject("Book not found");
      }
    });

    res.json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// GET /author/:author: Get books based on author
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params;
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
      if (result.length > 0) {
        resolve(result);
      } else {
        reject("No books found for this author");
      }
    });

    res.json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// GET /title/:title: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;
  try {
    const booksByTitle = await new Promise((resolve, reject) => {
      const result = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
      if (result.length > 0) {
        resolve(result);
      } else {
        reject("No books found with this title");
      }
    });

    res.json(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// GET /review/:isbn: Get book reviews based on ISBN
public_users.get('/review/:isbn', async function (req, res) {
  const { isbn } = req.params;
  try {
    const reviews = await new Promise((resolve, reject) => {
      const book = books[isbn];  // Find the book using ISBN
      if (book && book.reviews) {
        resolve(book.reviews);
      } else {
        reject("No reviews found for this book");
      }
    });

    res.json(reviews);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

module.exports.general = public_users;
