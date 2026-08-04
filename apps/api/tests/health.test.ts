import request from 'supertest';
import app from '../src/app';


// Mock the Neo4j driver
jest.mock('../src/database/neo4j', () => ({
  initDriver: jest.fn(),
  getDriver: jest.fn(() => ({
    verifyConnectivity: jest.fn().mockResolvedValue({ server: { version: '5.20.0' } })
  })),
  closeDriver: jest.fn(),
  checkConnection: jest.fn().mockResolvedValue(true),
}));

describe('Health Endpoint', () => {
  it('should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: {
        status: 'ok',
        database: 'connected',
        timestamp: expect.any(String)
      }
    });
  });
});
