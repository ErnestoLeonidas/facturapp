module.exports = function migration(db) {
  const target = db.prepare(`
    SELECT id
    FROM app_user
    WHERE lower(COALESCE(username, email)) = 'valgian'
       OR lower(email) = 'valgian'
       OR nombre = 'Administrador Valgian'
    LIMIT 1
  `).get();

  if (!target) return;

  db.prepare(`
    UPDATE app_user
    SET nombre = 'Valeria Giannattasio',
        username = 'vgianna',
        email = 'vgianna',
        updated_at = datetime('now')
    WHERE id = ?
  `).run(target.id);
};
