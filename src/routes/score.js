const router = require('express').Router();
const DatabaseManager = require('../database').getInstance();

router.get('', (request, response) => {
  console.log(request.params);
  if (!request.query.username) {
    response.status(400).json('You need to provide your username.');
    return;
  }

  const sql = 'SELECT COUNT(*) FROM trash '
            + 'WHERE username = ?;';

  DatabaseManager.getDatabase().query(sql, request.query.username, (results) => {
    response.json({ score: results });
  });
});

module.exports = router;
