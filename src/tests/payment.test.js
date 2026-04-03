const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Invoice = require('../models/invoice.model');
const Payment = require('../models/payment.model');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoServer;
let agentToken;
let adminToken;
let testInvoiceId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users
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

  // Login to get tokens
  const agentLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'agent@example.com', password: 'agentpass' });
  agentToken = agentLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'adminpass' });
  adminToken = adminLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

  // Create a test client and invoice
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

  const invoice = new Invoice({
    client: client._id,
    amount: 1000,
    amountPaid: 0,
    status: 'pending',
    description: 'Test invoice',
    dueDate: new Date('2024-12-31'),
    createdBy: agentUser._id
  });
  await invoice.save();
  testInvoiceId = invoice._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Payment.deleteMany({});
  // Reset invoice amountPaid
  await Invoice.findByIdAndUpdate(testInvoiceId, { amountPaid: 0, status: 'pending' });
});

describe('Payment Routes', () => {
  describe('POST /api/payment/', () => {
    it('should create a new payment as agent', async () => {
      const res = await request(app)
        .post('/api/payment/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          invoice: testInvoiceId,
          amount: 500,
          method: 'cash',
          note: 'Test payment'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('Payment recorded successfully');
      expect(res.body.payment.amount).toEqual(500);
    });

    it('should not create payment exceeding remaining balance', async () => {
      const res = await request(app)
        .post('/api/payment/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          invoice: testInvoiceId,
          amount: 1500, // exceeds 1000
          method: 'cash'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Payment exceeds remaining balance');
    });

    it('should not create payment with missing fields', async () => {
      const res = await request(app)
        .post('/api/payment/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          invoice: testInvoiceId
          // missing amount and method
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/payment/', () => {
    it('should get all payments', async () => {
      // Create a test payment
      const payment = new Payment({
        invoice: testInvoiceId,
        amount: 500,
        method: 'cash',
        recordedBy: mongoose.Types.ObjectId()
      });
      await payment.save();

      const res = await request(app)
        .get('/api/payment/')
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.payments).toHaveLength(1);
    });
  });

  describe('GET /api/payment/:id', () => {
    it('should get payment by id', async () => {
      const payment = new Payment({
        invoice: testInvoiceId,
        amount: 500,
        method: 'cash',
        recordedBy: mongoose.Types.ObjectId()
      });
      await payment.save();

      const res = await request(app)
        .get(`/api/payment/${payment._id}`)
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.amount).toEqual(500);
    });
  });

  describe('DELETE /api/payment/:id', () => {
    it('should delete payment as admin', async () => {
      const payment = new Payment({
        invoice: testInvoiceId,
        amount: 500,
        method: 'cash',
        recordedBy: mongoose.Types.ObjectId()
      });
      await payment.save();

      const res = await request(app)
        .delete(`/api/payment/${payment._id}`)
        .set('Cookie', `jwt=${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Payment deleted successfully');
    });
  });
});