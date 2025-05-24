/* eslint-env jest */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Mărește timeout-ul global pentru Jest
jest.setTimeout(60000); // 60 secunde

// Folosește o bază de date de test separată
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/test-db';

describe('Auth Controller', () => {
  // Configurează conexiunea la baza de date înainte de toate testele
  beforeAll(async () => {
    try {
      console.log('Connecting to MongoDB at:', TEST_DB_URI);
      await mongoose.connect(TEST_DB_URI);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }, 60000); // Mărește timeout-ul la 60 secunde

  // Închide conexiunea la baza de date după ce toate testele sunt finalizate
  afterAll(async () => {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }, 60000);

  // Curăță baza de date înainte de fiecare test
  beforeEach(async () => {
    try {
      await User.deleteMany({});
    } catch (error) {
      console.error('Error cleaning up test database:', error);
    }
  });

  describe('POST /users/login', () => {
    it('should return 200, token and user object when login is successful', async () => {
      // Arrange - pregătim datele de test
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        subscription: 'starter'
      };
      
      // Creăm un utilizator în baza de date pentru a testa login-ul
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        email: userData.email,
        password: hashedPassword,
        subscription: userData.subscription
      });

      // Act - executăm acțiunea care trebuie testată
      const response = await request(app)
        .post('/users/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      // Assert - verificăm rezultatele
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('subscription', userData.subscription);
      expect(typeof response.body.user.email).toBe('string');
      expect(typeof response.body.user.subscription).toBe('string');
    });

    it('should return 401 when login credentials are invalid', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        email: userData.email,
        password: hashedPassword,
        subscription: 'starter'
      });

      // Act - încercăm să ne logăm cu o parolă greșită
      const response = await request(app)
        .post('/users/login')
        .send({
          email: userData.email,
          password: 'wrong_password'
        });

      // Assert
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'Email or password is wrong');
    });

    it('should return 401 when user does not exist', async () => {
      // Act - încercăm să ne logăm cu un email care nu există în baza de date
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      // Assert
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'Email or password is wrong');
    });
  });
});