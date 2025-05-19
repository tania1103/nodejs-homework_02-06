jest.setTimeout(60000);

// Suprimă avertismentele MongoDB pentru opțiuni deprecate
process.env.MONGODB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/test-db';