// server.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { books, users } from './data.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const JWT_SECRET = 'super-secret-demo-key'; // демо-ключ для навчальних цілей

// ===== Helper: auth middleware =====
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { username }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ===== Public routes (Общие пользователи) =====
// Task 1: Get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Task 2: Get book by ISBN
app.get('/books/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// Task 3: Get all books by author (case-insensitive contains)
app.get('/books/author/:author', (req, res) => {
  const q = req.params.author.toLowerCase();
  const result = books.filter(b => (b.author || '').toLowerCase().includes(q));
  res.json(result);
});

// Task 4: Get all books by title (case-insensitive contains)
app.get('/books/title/:title', (req, res) => {
  const q = req.params.title.toLowerCase();
  const result = books.filter(b => (b.title || '').toLowerCase().includes(q));
  res.json(result);
});

// Task 5: Get reviews for a book
app.get('/books/:isbn/review', (req, res) => {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book.reviews || {});
});

// Task 6: Register new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'User already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  res.status(201).json({ message: 'User registered' });
});

// Task 7: Login registered user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// ===== Protected routes (Зарегистрированные пользователи) =====
// Task 8: Add/Update a review for a book by the logged-in user
app.put('/auth/review/:isbn', auth, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (typeof review !== 'string' || !review.trim()) return res.status(400).json({ error: 'review text required' });
  book.reviews = book.reviews || {};
  book.reviews[req.user.username] = review.trim();
  res.json({ message: 'Review saved', reviews: book.reviews });
});

// Task 9: Delete a review added by this user
app.delete('/auth/review/:isbn', auth, (req, res) => {
  const { isbn } = req.params;
  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.reviews && book.reviews[req.user.username]) {
    delete book.reviews[req.user.username];
    return res.json({ message: 'Review deleted', reviews: book.reviews });
  }
  res.status(404).json({ error: 'No review by this user' });
});

// Health
app.get('/', (req, res) => res.send('Book Store API is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
