const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  if (isValid(username)) {
    return res.status(409).json({message: "Username already exists."});
  }

  users.push({username: username, password: password});
  return res.status(200).json({message: "User successfully registered. Now you can login."});
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({message: `No book found for ISBN ${isbn}.`});
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const isbns = Object.keys(books);
  const matches = isbns
    .filter((isbn) => books[isbn].author === author)
    .map((isbn) => ({isbn, ...books[isbn]}));

  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({books: matches}, null, 4));
  } else {
    return res.status(404).json({message: `No books found for author "${author}".`});
  }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const isbns = Object.keys(books);
  const matches = isbns
    .filter((isbn) => books[isbn].title === title)
    .map((isbn) => ({isbn, ...books[isbn]}));

  if (matches.length > 0) {
    return res.status(200).send(JSON.stringify({books: matches}, null, 4));
  } else {
    return res.status(404).json({message: `No books found for title "${title}".`});
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({message: `No book found for ISBN ${isbn}.`});
  }
});

module.exports.general = public_users;

/* ------------------------------------------------------------------
   Tasks 10-13: the same four lookups above, re-implemented as
   standalone functions that call this same REST API over HTTP using
   Axios, with async/await or Promise (.then/.catch) syntax — per the
   lab's instruction to redo Tasks 1-4 "using Promise callbacks or
   async-await with Axios." These are NOT new Express routes (turning
   them into routes that call themselves via axios would recurse).
   They're demonstrated as callable functions, exported for reuse.
   ------------------------------------------------------------------ */

const BASE_URL = "http://localhost:5000";

// Task 10: Get the list of all books - async/await with Axios
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books:\n", JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error("getAllBooks error:", error.message);
  }
}

// Task 11: Get book details based on ISBN - Promise callbacks
function getBookByISBN(isbn) {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Book for ISBN ${isbn}:\n`, JSON.stringify(response.data, null, 4));
      return response.data;
    })
    .catch((error) => {
      console.error(`getBookByISBN(${isbn}) error:`, error.message);
    });
}

// Task 12: Get book details based on author - async/await with Axios
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by ${author}:\n`, JSON.stringify(response.data, null, 4));
    return response.data;
  } catch (error) {
    console.error(`getBooksByAuthor(${author}) error:`, error.message);
  }
}

// Task 13: Get book details based on title - Promise callbacks
function getBooksByTitle(title) {
  return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => {
      console.log(`Books titled "${title}":\n`, JSON.stringify(response.data, null, 4));
      return response.data;
    })
    .catch((error) => {
      console.error(`getBooksByTitle(${title}) error:`, error.message);
    });
}

module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
