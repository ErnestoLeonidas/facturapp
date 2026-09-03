function usernameOf(user) {
  return String((user && (user.username || user.email)) || '').trim().toLowerCase();
}

function isAdmin(user) {
  return !!user && user.rol === 'admin';
}

function isPlatformUser(user) {
  return usernameOf(user) === 'plataformas';
}

function hasOperationalFullAccess(user) {
  return isAdmin(user) || isPlatformUser(user);
}

function coordinadorScope(req) {
  const user = req && req.user;
  if (!user || hasOperationalFullAccess(user)) return null;
  return user.coordinador_id || '__none__';
}

function canViewOperationalResource(req, resource) {
  const user = req && req.user;
  if (hasOperationalFullAccess(user)) return true;
  return !!(user && user.coordinador_id && resource && resource.coordinador_id === user.coordinador_id);
}

module.exports = {
  canViewOperationalResource,
  coordinadorScope,
  hasOperationalFullAccess,
  isAdmin,
  isPlatformUser,
  usernameOf
};
