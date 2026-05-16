const r = require('express').Router();
const { ok, fail } = require('../middleware/envelope');
const auth = require('../services/auth');
const audit = require('../services/audit');

r.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const session = auth.authenticate(email, password);
  if (!session) return fail(res, 'AUTH_INVALID', 'Email o password incorrecto', null, 401);
  audit.log({ user: session.user, body: req.body }, 'login', 'auth', session.user.id, { email: session.user.email });
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
