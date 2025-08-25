// client.js
import axios from 'axios';


const API = 'http://localhost:3000';


// Task 10: Отримати всі книги — "використання функції з callback + async/await"
function getAllBooksWithCallback(cb) {
(async () => {
try {
const res = await axios.get(`${API}/books`);
cb(null, res.data);
} catch (err) {
cb(err);
}
})();
}


// Task 11: Пошук за ISBN — Promises (.then/.catch)
function searchByISBN(isbn) {
return axios.get(`${API}/books/isbn/${isbn}`)
.then(res => res.data);
}


// Task 12: Пошук за автором — Promises
function searchByAuthor(author) {
return axios.get(`${API}/books/author/${encodeURIComponent(author)}`)
.then(res => res.data);
}


// Task 13: Пошук за назвою — Promises
function searchByTitle(title) {
return axios.get(`${API}/books/title/${encodeURIComponent(title)}`)
.then(res => res.data);
}


// === Demo run ===
getAllBooksWithCallback((err, data) => {
if (err) console.error('Task10 error:', err.message);
else console.log('Task10 all books:', data.map(b => b.title));
});


searchByISBN('9780590353427')
.then(b => console.log('Task11 by ISBN:', b.title))
.catch(e => console.error('Task11 error:', e.response?.data || e.message));


searchByAuthor('Rowling')
.then(list => console.log('Task12 by author count:', list.length))
.catch(e => console.error('Task12 error:', e.response?.data || e.message));


searchByTitle('harry')
.then(list => console.log('Task13 by title count:', list.length))
.catch(e => console.error('Task13 error:', e.response?.data || e.message));