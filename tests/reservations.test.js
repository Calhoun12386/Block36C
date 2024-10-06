const request = require('supertest');
const app = require('../server/index'); // Adjust the path to your Express app
const { createTables, destroyCustomer, destroyRestaurant } = require('../server/db');

beforeAll(async () => {
  // Connect to the database and create tables before any tests run
  await createTables();
});

afterAll(async () => {
  // Add cleanup logic if needed
});

describe('API Endpoints', () => {
  let customerId;

  // Test creating a new customer
  it('should create a new customer', async () => {
    const response = await request(app)
      .post('/api/customers')
      .send({ name: 'John Doe' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('John Doe');
    customerId = response.body.id; // Store customer ID for future tests
  });

  // Test fetching all customers
  it('should fetch all customers', async () => {
    const response = await request(app).get('/api/customers');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Check that at least one customer is returned
  });

  // Test fetching all restaurants
  it('should fetch all restaurants', async () => {
    const response = await request(app).get('/api/restaurants');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0); // Check that at least one restaurant is returned
  });

  // Test creating a reservation for a customer
  it('should create a new reservation for a customer', async () => {
    const restaurantResponse = await request(app)
      .post('/api/restaurants')
      .send({ name: 'Italian Bistro' }); // Ensure you have a restaurant to reference

    const restaurantId = restaurantResponse.body.id;

    const response = await request(app)
      .post(`/api/customers/${customerId}/reservations`)
      .send({
        restaurant_id: restaurantId,
        date: '2024-10-01',
        party_count: 4,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.restaurant_id).toBe(restaurantId);
    expect(response.body.party_count).toBe(4);
  });
});