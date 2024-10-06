// server/index.js
const express = require('express');
const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
} = require('./db');
const app = express();

app.use(express.json());

// Get all customers
app.get('/api/customers', async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

// Get all restaurants
app.get('/api/restaurants', async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

// Get all reservations
app.get('/api/reservations', async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM reservations`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  }
});

// Create a new customer
app.post('/api/customers', async (req, res, next) => {
    try {
      const { name } = req.body; // Extract name from the request body
      if (!name) {
        // Check if name is provided
        return res.status(400).send({ error: 'Name is required' });
      }
      const customer = await createCustomer({ name }); // Call the createCustomer function from db.js
      res.status(201).send(customer); // Send the created customer with status 201
    } catch (ex) {
      next(ex); // Pass errors to the error handling middleware
    }
  });

// Create a new reservation for a customer
app.post('/api/customers/:customer_id/reservations', async (req, res, next) => {
  try {
    const reservation = await createReservation({
      customer_id: req.params.customer_id,
      restaurant_id: req.body.restaurant_id,
      date: req.body.date,
      party_count: req.body.party_count,
    });
    res.status(201).send(reservation);
  } catch (ex) {
    next(ex);
  }
});

// Delete a reservation
app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
  try {
    await destroyReservation({
      id: req.params.id,
      customer_id: req.params.customer_id,
    });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
});

// Initialize the database and start the server
const init = async () => {
  try {
    console.log('Connecting to the database...');
    await client.connect();
    console.log('Connected to the database.');
    await createTables();
    console.log('Tables created.');

    // Example data
    const [john, jane] = await Promise.all([
      createCustomer({ name: 'John Doe' }),
      createCustomer({ name: 'Jane Doe' }),
    ]);
    const [italian, sushi] = await Promise.all([
      createRestaurant({ name: 'Italian Bistro' }),
      createRestaurant({ name: 'Sushi Place' }),
    ]);

    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());

    const [reservation1] = await Promise.all([
      createReservation({
        customer_id: john.id,
        restaurant_id: italian.id,
        date: '2024-10-01',
        party_count: 4,
      }),
    ]);

    console.log(await client.query('SELECT * FROM reservations'));

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

init();
module.exports = app;
/* 
//fetch tables
curl -X GET http://localhost:3000/api/customers 
curl -X GET http://localhost:3000/api/restaurants
curl -X GET http://localhost:3000/api/reservations


//create new customer
curl -X POST http://localhost:3000/api/customers \
-H "Content-Type: application/json" \
-d '{"name": "Steven Calhoun"}'


//create reservation
steven uuid=8ba3aea0-d518-488e-85e3-f59326c1f5f8
sushi uuid=90c44eaf-4cc1-4ca1-88fd-853a327dd839

curl -X POST http://localhost:3000/api/customers/8ba3aea0-d518-488e-85e3-f59326c1f5f8/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_id": "90c44eaf-4cc1-4ca1-88fd-853a327dd839",
    "date": "2024-10-15",
    "party_count": 10
  }'

  reservation uuid = 4666ce78-6f30-46ef-a760-41868bbc7509

  //detete created reservation
  curl -X DELETE http://localhost:3000/api/customers/8ba3aea0-d518-488e-85e3-f59326c1f5f8/reservations/4666ce78-6f30-46ef-a760-41868bbc7509

*/