const express = require('express');
const doc2xRouter = require('./doc2xService');
const jinaApi = require('./reader-service');

const app = express();
const PORT = process.env.PORT || 3003;

// Enable CORS for all routes
const cors = require('cors');
app.use(cors());

app.use('/api/doc2x', doc2xRouter);

app.use('/readurl', jinaApi);

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
