const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },

    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: Number,
        required: true
    },

    parentPhoneNumber: {
        type: Number,
        required: true
    },

    parentEmail: {
        type: String,
        required: true
    },

    studentClass: {
        type: String,
        required: true
    },

    roles: {
        User: {
            type: Number,
            default: 2001
        },
        Editor: Number,
        Admin: Number
    },

    refreshToken: {
        type: Array
    }
})

module.exports = mongoose.model('User', userSchema);