const r = require('express').Router();
const { ok, fail } = require('../middleware/envelope');
const auth = require('../services/auth');
const audit = require('../services/audit');

r.post('/login', async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};
    const identifier = username || email;
    const session = await auth.authenticate(identifier, password);
    if (!session) return fail(res, 'AUTH_INVALID', 'Usuario o password incorrecto', null, 401);
    await audit.log({ user: session.user, body: req.body }, 'login', 'auth', session.user.id, {
      username: session.user.username,
      email: session.user.email
    });
    ok(res, session);
  } catch (error) {
    next(error);
  }
});

r.post('/logout', async (req, res, next) => {
  try {
    await auth.logout(auth.tokenFromReq(req));
    ok(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
});

r.get('/me', async (req, res, next) => {
  try {
    ok(res, { user: await auth.publicUser(req.user) });
  } catch (error) {
    next(error);
  }
});

module.exports = r;
