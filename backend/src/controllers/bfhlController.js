/**
 * controllers/bfhlController.js
 *
 * Express router for POST /bfhl
 */

const { Router } = require('express');
const { processBFHL } = require('../services/bfhlService');

const router = Router();

router.post('/', (req, res) => {
  try {
    const { data, user_id, email_id, college_roll_number } = req.body;

    // Body-level validation
    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: 'Invalid request body: "data" must be an array of strings.',
      });
    }

    const result = processBFHL({ data, user_id, email_id, college_roll_number });
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof TypeError) {
      return res.status(400).json({ error: err.message });
    }
    throw err; // propagate to global error handler
  }
});

module.exports = router;
