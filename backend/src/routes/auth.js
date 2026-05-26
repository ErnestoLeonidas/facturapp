const r = require('express').Router();
const { ok, fail } = require('../middleware/envelope');
const auth = require('../services/auth');
const audit = require('../services/audit');

r.post('/login', (req, res) => {
  const { username, email, password } = req.body || {};
  const identifier = username || email;
  const session = auth.authenticate(identifier, password);
  if (!session) return fail(res, 'AUTH_INVALID', 'Usuario o password incorrecto', null, 401);
  audit.log({ user: session.user, body: req.body }, 'login', 'auth', session.user.id, {
    username: session.user.username,
    email: session.user.email
  });
  ok(res, session);
});

r.post('/logout', (req, res) => {
  auth.logout(auth.tokenFromReq(req));
  ok(res, { loggedOut: true });
});

r.get('/me', (req, res) => {
  ok(res, { user: auth.publicUser(req.user) });
});

module.exports = r;
