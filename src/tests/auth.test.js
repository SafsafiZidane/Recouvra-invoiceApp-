const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const hashedPassword = await bcrypt.hash('adminpass', 10);
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: 'adminpass' });

      const token = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

      const res = await request(app)
        .post('/api/auth/register')
        .set('Cookie', `jwt=${token}`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'agent'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('User registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'agent'
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'agent'
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
    });
  });
});