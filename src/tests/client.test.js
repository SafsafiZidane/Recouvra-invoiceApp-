const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoServer;
let agentToken;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);

  const agentPassword = await bcrypt.hash('agentpass', 10);
  const adminPassword = await bcrypt.hash('adminpass', 10);

  const agentUser = new User({
    name: 'Agent User',
    email: 'agent@example.com',
    password: agentPassword,
    role: 'agent'
  });
  await agentUser.save();

  const adminUser = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin'
  });
  await adminUser.save();

  const agentLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'agent@example.com', password: 'agentpass' });
  agentToken = agentLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'adminpass' });
  adminToken = adminLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Client.deleteMany({});
});

describe('Client Routes', () => {
  describe('POST /api/client/', () => {
    it('should create a new client as agent', async () => {
      const res = await request(app)
        .post('/api/client/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          name: 'Test Client',
          email: 'client@example.com',
          phone: '123456789',
          address: '123 Test St',
          company: 'Test Co',
          notes: 'Test notes'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('Client created');
    });

    it('should not create client with missing fields', async () => {
      const res = await request(app)
        .post('/api/client/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          name: 'Test Client'
          // missing email, phone, address, company, notes
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/client/', () => {
    it('should get all clients', async () => {
      const client = new Client({
        name: 'Test Client',
        email: 'client@example.com',
        phone: '123456789',
        address: '123 Test St',
        company: 'Test Co',
        notes: 'Test notes',
        createdBy: new mongoose.Types.ObjectId() // ✅ fixed deprecated call
      });
      await client.save();

      const res = await request(app)
        .get('/api/client/')
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.clients).toHaveLength(1);
    });
  });

  describe('GET /api/client/:id', () => {
    it('should get client by id', async () => {
      const client = new Client({
        name: 'Test Client',
        email: 'client@example.com',
        phone: '123456789',
        address: '123 Test St',
        company: 'Test Co',
        notes: 'Test notes',
        createdBy: new mongoose.Types.ObjectId()
      });
      await client.save();

      const res = await request(app)
        .get(`/api/client/${client._id}`)
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Test Client');
    });
  });

  describe('PUT /api/client/:id', () => {
    it('should update client as admin', async () => {
      const client = new Client({
        name: 'Test Client',
        email: 'client@example.com',
        phone: '123456789',
        address: '123 Test St',
        company: 'Test Co',
        notes: 'Test notes',
        createdBy: new mongoose.Types.ObjectId()
      });
      await client.save();

      const res = await request(app)
        .put(`/api/client/${client._id}`)
        .set('Cookie', `jwt=${adminToken}`)
        .send({
          name: 'Updated Client',
          phone: '987654321'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.client.name).toEqual('Updated Client');
    });

    it('should not allow agent to update client', async () => {
      const client = new Client({
        name: 'Test Client',
        email: 'client@example.com',
        phone: '123456789',
        address: '123 Test St',
        company: 'Test Co',
        notes: 'Test notes',
        createdBy: new mongoose.Types.ObjectId()
      });
      await client.save();

      const res = await request(app)
        .put(`/api/client/${client._id}`)
        .set('Cookie', `jwt=${agentToken}`)
        .send({ name: 'Hacked' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/client/:id', () => {
    it('should delete client as admin', async () => {
      const client = new Client({
        name: 'Test Client',
        email: 'client@example.com',
        phone: '123456789',
        address: '123 Test St',
        company: 'Test Co',
        notes: 'Test notes',
        createdBy: new mongoose.Types.ObjectId()
      });
      await client.save();

      const res = await request(app)
        .delete(`/api/client/${client._id}`)
        .set('Cookie', `jwt=${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Client deleted');
    });

    it('should not allow agent to delete client', async () => {
      const client = new Client({
        name: 'Test Client',
        email: 'client@example.com',
        phone: '123456789',
        address: '123 Test St',
        company: 'Test Co',
        notes: 'Test notes',
        createdBy: new mongoose.Types.ObjectId()
      });
      await client.save();

      const res = await request(app)
        .delete(`/api/client/${client._id}`)
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});