const request = require('supertest');
const express = require('express');
const positionRoutes = require('../../routes/positions');
const { sequelize } = require('../../config/database');

// Mock the database
jest.mock('../../config/database', () => ({
  sequelize: {
    transaction: jest.fn(() => Promise.resolve({
      commit: jest.fn(),
      rollback: jest.fn(),
      finished: false
    }))
  }
}));

// Mock operation log service
jest.mock('../../services/operationLogService', () => ({
  logPositionCreation: jest.fn(),
  logPositionUpdate: jest.fn(),
  logPositionDeletion: jest.fn()
}));

// Mock models with proper structure
jest.mock('../../models/Position', () => ({
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
}));

jest.mock('../../models/Enterprise', () => ({
  findOne: jest.fn()
}));

jest.mock('../../models/Application', () => ({
  count: jest.fn()
}));

const Position = require('../../models/Position');
const Enterprise = require('../../models/Enterprise');
const Application = require('../../models/Application');

// Mock authenticate middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, username: 'testuser', role: 'enterprise' };
    next();
  },
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
  }
}));

// Create test app
const app = express();
app.use(express.json());
app.use('/api/positions', positionRoutes);

// Add error handler
app.use((err, req, res, next) => {
  console.error('Test error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message
    }
  });
});

describe('Position Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/positions', () => {
    it('should create a position with valid data', async () => {
      const positionData = {
        title: 'Frontend Developer Intern',
        description: 'Looking for a frontend developer intern',
        requirements: 'React, JavaScript',
        total_slots: 5,
        start_date: '2024-01-01',
        end_date: '2024-06-30'
      };

      const mockEnterprise = { id: 1, user_id: 1, company_name: 'Test Company' };
      const mockPosition = {
        id: 1,
        enterprise_id: 1,
        ...positionData,
        available_slots: 5,
        status: 'open'
      };

      Enterprise.findOne = jest.fn().mockResolvedValue(mockEnterprise);
      Position.create = jest.fn().mockResolvedValue(mockPosition);

      const response = await request(app)
        .post('/api/positions')
        .send(positionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(positionData.title);
    });

    it('should reject position with missing required fields', async () => {
      const invalidData = {
        title: 'Frontend Developer Intern'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject position with invalid date range', async () => {
      const invalidData = {
        title: 'Frontend Developer Intern',
        description: 'Looking for a frontend developer intern',
        total_slots: 5,
        start_date: '2024-06-30',
        end_date: '2024-01-01' // End date before start date
      };

      const mockEnterprise = { id: 1, user_id: 1, company_name: 'Test Company' };
      Enterprise.findOne = jest.fn().mockResolvedValue(mockEnterprise);

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject position with invalid total_slots', async () => {
      const invalidData = {
        title: 'Frontend Developer Intern',
        description: 'Looking for a frontend developer intern',
        total_slots: 0, // Invalid: must be at least 1
        start_date: '2024-01-01',
        end_date: '2024-06-30'
      };

      const mockEnterprise = { id: 1, user_id: 1, company_name: 'Test Company' };
      Enterprise.findOne = jest.fn().mockResolvedValue(mockEnterprise);

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/positions', () => {
    it('should return positions list', async () => {
      const mockPositions = [
        {
          id: 1,
          title: 'Frontend Developer',
          description: 'Frontend position',
          enterprise: { id: 1, company_name: 'Company A' }
        },
        {
          id: 2,
          title: 'Backend Developer',
          description: 'Backend position',
          enterprise: { id: 2, company_name: 'Company B' }
        }
      ];

      Position.findAndCountAll = jest.fn().mockResolvedValue({
        count: 2,
        rows: mockPositions
      });

      Position.update = jest.fn().mockResolvedValue([0]);

      const response = await request(app).get('/api/positions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.positions).toHaveLength(2);
    });

    it('should filter positions by keyword', async () => {
      const mockPositions = [
        {
          id: 1,
          title: 'Frontend Developer',
          description: 'React developer',
          enterprise: { id: 1, company_name: 'Company A' }
        }
      ];

      Position.findAndCountAll = jest.fn().mockResolvedValue({
        count: 1,
        rows: mockPositions
      });

      Position.update = jest.fn().mockResolvedValue([0]);

      const response = await request(app)
        .get('/api/positions')
        .query({ keyword: 'Frontend' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Position.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('GET /api/positions/:id', () => {
    it('should return position details', async () => {
      const mockPosition = {
        id: 1,
        title: 'Frontend Developer',
        description: 'Frontend position',
        enterprise: { id: 1, company_name: 'Company A' }
      };

      Position.findByPk = jest.fn().mockResolvedValue(mockPosition);

      const response = await request(app).get('/api/positions/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 for non-existent position', async () => {
      Position.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app).get('/api/positions/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/positions/:id', () => {
    it('should update position', async () => {
      const mockEnterprise = { id: 1, user_id: 1 };
      const mockPosition = {
        id: 1,
        enterprise_id: 1,
        title: 'Old Title',
        description: 'Old Description',
        total_slots: 5,
        available_slots: 5,
        update: jest.fn().mockResolvedValue(true),
        reload: jest.fn().mockResolvedValue(true)
      };

      Enterprise.findOne = jest.fn().mockResolvedValue(mockEnterprise);
      Position.findByPk = jest.fn().mockResolvedValue(mockPosition);

      const updateData = {
        title: 'New Title',
        description: 'New Description'
      };

      const response = await request(app)
        .put('/api/positions/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPosition.update).toHaveBeenCalled();
    });

    it('should reject update from non-owner', async () => {
      const mockEnterprise = { id: 2, user_id: 1 }; // Different enterprise
      const mockPosition = {
        id: 1,
        enterprise_id: 1 // Owned by enterprise 1
      };

      Enterprise.findOne = jest.fn().mockResolvedValue(mockEnterprise);
      Position.findByPk = jest.fn().mockResolvedValue(mockPosition);

      const response = await request(app)
        .put('/api/positions/1')
        .send({ title: 'New Title' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/positions/:id', () => {
    it('should delete position without pending applications', async () => {
      const mockEnterprise = { id: 1, user_id: 1 };
      const mockPosition = {
        id: 1,
        enterprise_id: 1,
        destroy: jest.fn().mockResolvedValue(true)
      };

      Enterprise.findOne = jest.fn().mockResolvedValue(mockEnterprise);
      Position.findByPk = jest.fn().mockResolvedValue(mockPosition);
      Application.count = jest.fn().mockResolvedValue(0);

      const response = await request(app).delete('/api/positions/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPosition.destroy).toHaveBeenCalled();
    });

    it('should reject delete with pending applications', async () => {
      const mockEnterprise = { id: 1, user_id: 1 };
      const mockPosition = {
        id: 1,
        enterprise_id: 1
      };

      Enterprise.findOne = jest.fn().mockResolvedValue(mockEnterprise);
      Position.findByPk = jest.fn().mockResolvedValue(mockPosition);
      Application.count = jest.fn().mockResolvedValue(2); // Has pending applications

      const response = await request(app).delete('/api/positions/1');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });
});
