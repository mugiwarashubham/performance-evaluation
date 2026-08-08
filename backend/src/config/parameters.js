// The 5 fixed feedback parameters. Kept as a single shared source of truth
// (also mirrored in the frontend) instead of a per-company DB collection,
// since the brief specifies fixed parameters, not customizable ones.
module.exports = [
  'Ownership',
  'Communication',
  'Quality of Work',
  'Collaboration',
  'Initiative'
];
