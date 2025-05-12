const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const Note = require('./models/Note');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/notes-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home Page - Show all notes
app.get('/', async (req, res) => {
  const notes = await Note.find();
  const list = notes.map(note => `
    <li>
      <strong>${note.title}</strong><br>
      ${note.content}
      <div>
        <form action="/delete/${note._id}" method="POST" style="display:inline;">
          <button type="submit">❌ Delete</button>
        </form>
        <form action="/edit/${note._id}" method="GET" style="display:inline;">
          <button type="submit">✏️ Edit</button>
        </form>
      </div>
    </li>
  `).join('');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Notes App</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <h1>📝 Notes App</h1>
      <form method="POST" action="/add">
        <input name="title" placeholder="Note title" required>
        <textarea name="content" placeholder="Note content" required></textarea>
        <button>Add Note</button>
      </form>
      <ul>${list}</ul>
    </body>
    </html>
  `);
});

// Add new note
app.post('/add', async (req, res) => {
  const { title, content } = req.body;
  await new Note({ title, content }).save();
  res.redirect('/');
});

// Delete note
app.post('/delete/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Show edit form
app.get('/edit/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Edit Note</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <h1>Edit Note</h1>
      <form method="POST" action="/edit/${note._id}">
        <input name="title" value="${note.title}" required>
        <textarea name="content" required>${note.content}</textarea>
        <button>Update</button>
      </form>
      <p><a href="/">⬅️ Back</a></p>
    </body>
    </html>
  `);
});

// Handle edit submission
app.post('/edit/:id', async (req, res) => {
  await Note.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content
  });
  res.redirect('/');
});

// Start the server
app.listen(3000, () => {
  console.log('✅ Notes App running at http://localhost:3000');
});
