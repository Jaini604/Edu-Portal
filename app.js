const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth'); // Make sure this path is correct
const connectDB = require('./db'); // Assuming your db.js file is correctly set up

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up session middleware
app.use(session({
  secret: 'your_secret_key', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files (for CSS)
app.use(express.static('public'));

// Connect to MongoDB (without using useNewUrlParser & useUnifiedTopology)
connectDB();

// Use the auth routes
app.use('/auth', authRoutes); // This adds the prefix '/auth' to all routes in authRoutes

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/auth/home`);
});
