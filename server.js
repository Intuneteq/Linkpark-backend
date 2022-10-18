require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const {errorHandler} = require('./Middleware/errorHandler');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const {corsOptions} = require('./Config/corsOptions');
const compression = require("compression");
const helmet = require("helmet");
const { logger } = require('./Middleware/logEvents');
const credentials = require('./Middleware/credentials');
const verifyJWT = require('./Middleware/verifyJwt');
const connectDB = require('./Config/dbConn');

const PORT = process.env.PORT || 3500;

connectDB();

app.use(logger);

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(helmet());  //helps send necessary headers with request and response

app.use(express.json());

app.use(cookieParser());

app.use(compression()); //compress routes for public server

app.use('/', express.static(path.join(__dirname, '/public')));

//routes
app.use('/', require('./routes/root'));
app.use('/api/register', require('./routes/register'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/refresh', require('./routes/refresh'));
app.use('/api/logout', require('./routes/logOut'));

app.use(verifyJWT);
app.use('/api/users', require('./routes/user'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'Views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});


app.use(errorHandler);

mongoose.connection.once('open', ()=> {
    console.log('Connected to DB')
    app.listen(PORT, ()=> console.log(`server running on port ${PORT}`));
})
