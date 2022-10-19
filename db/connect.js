const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DATABASE;
exports.connect = () => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: dbName,
    });
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connection established.');
    });
};
