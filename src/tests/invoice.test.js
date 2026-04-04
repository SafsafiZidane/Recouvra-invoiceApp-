const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Invoice = require('../models/invoice.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoServer;
let agentToken;
let adminToken;
let testClientId;

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

  const client = new Client({
    name: 'Test Client',
    email: 'client@example.com',
    phone: '123456789',
    address: '123 Test St',
    company: 'Test Co',
    notes: 'Test notes',
    createdBy: agentUser._id
  });
  await client.save();
  testClientId = client._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Invoice.deleteMany({});
});

// ✅ Future date helper — Joi requires dueDate greater than now
const futureDateStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

describe('Invoice Routes', () => {
  describe('POST /api/invoice/', () => {
    it('should create a new invoice as agent', async () => {
      const res = await request(app)
        .post('/api/invoice/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          client: testClientId,
          amount: 1000,
          amountPaid: 0,
          status: 'pending',
          description: 'Test invoice',
          dueDate: futureDateStr() // ✅ must be in the future
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('invoice created');
    });

    it('should not create invoice with missing fields', async () => {
      const res = await request(app)
        .post('/api/invoice/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          client: testClientId
          // missing amount, amountPaid, status, description, dueDate
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should not create invoice with past dueDate', async () => {
      const res = await request(app)
        .post('/api/invoice/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          client: testClientId,
          amount: 1000,
          amountPaid: 0,
          status: 'pending',
          description: 'Test invoice',
          dueDate: '2020-01-01' // ✅ in the past — should fail
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/invoice/', () => {
    it('should get all invoices', async () => {
      const invoice = new Invoice({
        client: testClientId,
        amount: 1000,
        amountPaid: 0,
        status: 'pending',
        description: 'Test invoice',
        dueDate: new Date(futureDateStr()),
        createdBy: new mongoose.Types.ObjectId() // ✅ fixed deprecated call
      });
      await invoice.save();

      const res = await request(app)
        .get('/api/invoice/')
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.invoices).toHaveLength(1);
    });
  });

  describe('GET /api/invoice/:id', () => {
    it('should get invoice by id', async () => {
      const invoice = new Invoice({
        client: testClientId,
        amount: 1000,
        amountPaid: 0,
        status: 'pending',
        description: 'Test invoice',
        dueDate: new Date(futureDateStr()),
        createdBy: new mongoose.Types.ObjectId()
      });
      await invoice.save();

      const res = await request(app)
        .get(`/api/invoice/${invoice._id}`)
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.amount).toEqual(1000);
    });
  });

  describe('PUT /api/invoice/:id', () => {
    it('should update invoice as admin', async () => {
      const invoice = new Invoice({
        client: testClientId,
        amount: 1000,
        amountPaid: 0,
        status: 'pending',
        description: 'Test invoice',
        dueDate: new Date(futureDateStr()),
        createdBy: new mongoose.Types.ObjectId()
      });
      await invoice.save();

      const res = await request(app)
        .put(`/api/invoice/${invoice._id}`)
        .set('Cookie', `jwt=${adminToken}`)
        .send({ status: 'paid', amountPaid: 1000 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.invoice.status).toEqual('paid');
    });

    it('should not allow agent to update invoice', async () => {
      const invoice = new Invoice({
        client: testClientId,
        amount: 1000,
        amountPaid: 0,
        status: 'pending',
        description: 'Test invoice',
        dueDate: new Date(futureDateStr()),
        createdBy: new mongoose.Types.ObjectId()
      });
      await invoice.save();

      const res = await request(app)
        .put(`/api/invoice/${invoice._id}`)
        .set('Cookie', `jwt=${agentToken}`)
        .send({ status: 'paid' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/invoice/:id', () => {
    it('should delete invoice as admin', async () => {
      const invoice = new Invoice({
        client: testClientId,
        amount: 1000,
        amountPaid: 0,
        status: 'pending',
        description: 'Test invoice',
        dueDate: new Date(futureDateStr()),
        createdBy: new mongoose.Types.ObjectId()
      });
      await invoice.save();

      const res = await request(app)
        .delete(`/api/invoice/${invoice._id}`)
        .set('Cookie', `jwt=${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Invoice deleted');
    });
  });
});