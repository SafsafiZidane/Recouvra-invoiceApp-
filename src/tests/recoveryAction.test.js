const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Invoice = require('../models/invoice.model');
const RecoveryAction = require('../models/recoveryAction.model');
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
  await RecoveryAction.deleteMany({});
});

describe('Recovery Action Routes', () => {
  describe('POST /api/recovery-action/', () => {
    it('should create a new recovery action as agent', async () => {
      const res = await request(app)
        .post('/api/recovery-action/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          invoice: testInvoiceId,
          type: 'call',
          note: 'Called client about payment',
          outcome: 'Will pay next week'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain('Recovery action created successfully');
      expect(res.body.recoveryAction.type).toEqual('call');
    });

    it('should not create recovery action with missing fields', async () => {
      const res = await request(app)
        .post('/api/recovery-action/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          invoice: testInvoiceId
          // missing type and note
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/recovery-action/', () => {
    it('should get all recovery actions', async () => {
      // Create a test recovery action
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: mongoose.Types.ObjectId(),
        type: 'email',
        note: 'Sent reminder email'
      });
      await action.save();

      const res = await request(app)
        .get('/api/recovery-action/')
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.recoveryActions).toHaveLength(1);
    });
  });

  describe('GET /api/recovery-action/:id', () => {
    it('should get recovery action by id', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: mongoose.Types.ObjectId(),
        type: 'call',
        note: 'Called client'
      });
      await action.save();

      const res = await request(app)
        .get(`/api/recovery-action/${action._id}`)
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.type).toEqual('call');
    });
  });

  describe('PUT /api/recovery-action/:id', () => {
    it('should update recovery action as admin', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: mongoose.Types.ObjectId(),
        type: 'call',
        note: 'Called client'
      });
      await action.save();

      const res = await request(app)
        .put(`/api/recovery-action/${action._id}`)
        .set('Cookie', `jwt=${adminToken}`)
        .send({
          outcome: 'Payment promised'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.recoveryAction.outcome).toEqual('Payment promised');
    });
  });

  describe('DELETE /api/recovery-action/:id', () => {
    it('should delete recovery action as admin', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: mongoose.Types.ObjectId(),
        type: 'email',
        note: 'Sent email'
      });
      await action.save();

      const res = await request(app)
        .delete(`/api/recovery-action/${action._id}`)
        .set('Cookie', `jwt=${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Recovery action deleted successfully');
    });
  });
});