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
let agentUserId;

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
  agentUserId = agentUser._id;

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
          agent: agentUserId,                        // ✅ required by your Joi validator
          type: 'call',
          note: 'Called client about payment',
          outcome: 'Will pay next week',
          nextActionDate: new Date('2025-01-15'),    // ✅ required by your Joi validator
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
          // missing agent, type, note, nextActionDate
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should not create recovery action with invalid type', async () => {
      const res = await request(app)
        .post('/api/recovery-action/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          invoice: testInvoiceId,
          agent: agentUserId,
          type: 'fax',                              // ✅ invalid — not in enum
          note: 'Sent a fax to client',
          nextActionDate: new Date('2025-01-15'),
        });

      expect(res.statusCode).toEqual(400);
    });

    it('should not create recovery action with note too short', async () => {
      const res = await request(app)
        .post('/api/recovery-action/')
        .set('Cookie', `jwt=${agentToken}`)
        .send({
          invoice: testInvoiceId,
          agent: agentUserId,
          type: 'email',
          note: 'Hi',                               // ✅ too short — min 5 chars
          nextActionDate: new Date('2025-01-15'),
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/recovery-action/', () => {
    it('should get all recovery actions', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: agentUserId,                         // ✅ use real agentUserId
        type: 'email',
        note: 'Sent reminder email',
        nextActionDate: new Date('2025-01-15'),
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
        agent: agentUserId,
        type: 'call',
        note: 'Called client',
        nextActionDate: new Date('2025-01-15'),
      });
      await action.save();

      const res = await request(app)
        .get(`/api/recovery-action/${action._id}`)
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.type).toEqual('call');
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/recovery-action/${fakeId}`)
        .set('Cookie', `jwt=${agentToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/recovery-action/:id', () => {
    it('should update recovery action as admin', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: agentUserId,
        type: 'call',
        note: 'Called client',
        nextActionDate: new Date('2025-01-15'),
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

    it('should not allow agent to update recovery action', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: agentUserId,
        type: 'call',
        note: 'Called client',
        nextActionDate: new Date('2025-01-15'),
      });
      await action.save();

      const res = await request(app)
        .put(`/api/recovery-action/${action._id}`)
        .set('Cookie', `jwt=${agentToken}`)        // ✅ agent is forbidden on PUT
        .send({ outcome: 'Attempted update' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/recovery-action/:id', () => {
    it('should delete recovery action as admin', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: agentUserId,
        type: 'email',
        note: 'Sent email to client',
        nextActionDate: new Date('2025-01-15'),
      });
      await action.save();

      const res = await request(app)
        .delete(`/api/recovery-action/${action._id}`)
        .set('Cookie', `jwt=${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Recovery action deleted successfully');
    });

    it('should not allow agent to delete recovery action', async () => {
      const action = new RecoveryAction({
        invoice: testInvoiceId,
        agent: agentUserId,
        type: 'email',
        note: 'Sent email to client',
        nextActionDate: new Date('2025-01-15'),
      });
      await action.save();

      const res = await request(app)
        .delete(`/api/recovery-action/${action._id}`)
        .set('Cookie', `jwt=${agentToken}`);       // ✅ agent is forbidden on DELETE

      expect(res.statusCode).toEqual(403);
    });
  });
});