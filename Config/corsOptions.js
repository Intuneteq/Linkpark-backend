const whiteList = require('./whiteList');

const corsOptions = {
    origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1) { //remove !origin for production
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = {corsOptions};