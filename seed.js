const mongoose = require('mongoose');
const { Snippet, encrypt } = require('./models/Snippet'); // Import Snippet and encrypt
const seedData = require('./seedData.json');
const connectDB = require('./db');
const Counter = require('./models/Counter');

const initializeCounter = async () => {
    const highestId = Math.max(...seedData.map((snippet) => snippet.id));
    await Counter.findByIdAndUpdate(
        { _id: 'snippetId' },
        {$set: { seq: highestId }},
        { upsert: true }
    );
};

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Snippet.deleteMany(); // Correctly call deleteMany on the Snippet model

        // Insert seed data with _id mapped from id
        const formattedData = seedData.map(({ id, ...rest }) => ({
            _id: id,
            ...rest,
            code: encrypt(rest.code), // Encrypt the code before inserting
        }));
        await Snippet.insertMany(formattedData); // Use _id from seedData

        console.log('Database seeded successfully!');

        // Close the connection
        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding the database:', err.message);
        process.exit(1);
    }
};

seedDatabase();