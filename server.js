const express = require('express');
const expressHandlebars = require('express-handlebars');
const path = require('path');
const { connectToMongo } = require('./private/connection');
const { createReservation } = require('./private/controllers/reservations');
const server = express();

const handlebars = expressHandlebars.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => a == b
    }
});

server.engine('hbs', handlebars.engine);

server.set('view engine', 'hbs');
server.set('views', path.join(__dirname, 'views'));

server.use(express.json());
server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req, res) => {
    res.render('index', {
        page: '/',
        script: '/scripts/index.js'
    });
});

server.get('/flight-search', (req, res) => {
    res.sendFile(path.join(__dirname, './views/user/search.html'));
});

server.get('/flight-book', (req, res) => {
    res.render('booking', {
        page: '/flight-book',
        script: '/scripts/user/booking.js'
    });
});

server.get('/api/search', async (req, res) => {
  const { originAirport, destinationAirport, date } = req.query;
  
  // Construct dynamic query
  let query = {};
  if (originAirport) query.originAirport = originAirport;
  if (destinationAirport) query.destinationAirport = destinationAirport;
  if (date) {
    // Match the exact day in MongoDB regardless of time
    const start = new Date(date);
    start.setUTCHours(0,0,0,0);
    const end = new Date(date);
    end.setUTCHours(23,59,59,999);
    query.date = { $gte: start, $lte: end };
  }

  try {
    const results = await Record.find(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.post('/flight-book', (req, res) => {
    // if user has not picked flight and goes to this link,
    // redirect to flight-search

    try {
        const reservation = createReservation(req.body);
        res.status(200).json({ success: true, reservation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed To Create Reservation!' });
    }
});

server.get('/reservations', (req, res) => {
    res.render('reservations', {
        page: '/reservations',
        script: '/scripts/user/reservations.js'
    });
});

connectToMongo((err) => {
    if (err) {
        console.error('Server Not Started!');
    } else {
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`Server Running On http://localhost:${process.env.SERVER_PORT}!`);
        });
    }
});
    }
});
