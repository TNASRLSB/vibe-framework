/**
 * User routes.
 */
const users = [];
let nextId = 1;

exports.list = (req, res) => {
  res.json(users);
};

exports.create = (req, res) => {
  const { name, email, role } = req.body;
  const user = { id: nextId++, name, email, role: role || 'viewer', config: {} };
  users.push(user);
  res.status(201).json(user);
};

exports.getById = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

exports.update = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  res.json(user);
};

exports.remove = (req, res) => {
  const idx = users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  res.json({ deleted: true });
};

exports.getConfig = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.config || {});
};

exports.setConfig = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.config = { ...user.config, ...req.body };
  res.json(user.config);
};
