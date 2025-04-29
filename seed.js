const mongoose = require('mongoose');
const Snippet = require('./models/Snippet');
const seedData = require('./seedData.json');
const connectDB = require('./db');

const seedDatabase = async () => {
    try {
      await connectDB();
  
      // Clear existing data
      await Snippet.deleteMany();
  
      // Insert seed data
      const formattedData = seedData.map(({ id, ...rest }) => ({ _id: id, ...rest}));
      await Snippet.insertMany(formattedData) // keep seedData ID instead of Mongo unique _id
      console.log('Database seeded successfully!');
  
      // Close the connection
      mongoose.connection.close();
    } catch (err) {
      console.error('Error seeding the database:', err.message);
      process.exit(1);
    }
  };
  
  seedDatabase();