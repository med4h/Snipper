const mongoose = require('mongoose');
const { Snippet, encrypt } = require('./models/Snippet'); // Import Snippet and encrypt
const seedData = require('./seedData.json');
const connectDB = require('./db');
const Counter = require('./models/Counter');

const initializeCounter = async () => {
    await Counter.findByIdAndUpdate(
        { _id: 'snippetId' },
        {$set: { seq: 0 }},
        { upsert: true }
    );
};

const seedDatabase = async () => {
    try {
        await connectDB();

        // Initialize the counter
        await initializeCounter();

        // Clear existing data
        await Snippet.deleteMany();

        // Insert seed data
        for (const { id, ...rest } of seedData) {
            const snippet = new Snippet({
                ...rest,
            });
            await snippet.save(); // This triggers the pre('save') middleware
        }

        console.log('Database seeded successfully!');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding the database:', err.message);
        process.exit(1);
    }
};

seedDatabase();