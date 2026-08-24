const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const matches = users.filter((user) => user.username === username);
  return matches.length > 0;
};

const authenticatedUser = (username, password) => {
  const matches = users.filter((user) => user.username === username && user.password === password);
  return matches.length > 0;
};

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid username or password."});
  }

  const accessToken = jwt.sign({username: username}, 'access', {expiresIn: 60 * 60});

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({message: "User successfully logged in."});
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({message: `No book found for ISBN ${isbn}.`});
  }
  if (!review) {
    return res.status(400).json({message: "A 'review' query parameter is required."});
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: `Review for ISBN ${isbn} by "${username}" has been added/updated.`,
    reviews: book.reviews
  });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({message: `No book found for ISBN ${isbn}.`});
  }
  if (!book.reviews[username]) {
    return res.status(404).json({message: `No review by "${username}" found for ISBN ${isbn}.`});
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: `Review by "${username}" for ISBN ${isbn} has been deleted.`,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
