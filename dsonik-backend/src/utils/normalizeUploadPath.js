const normalizeUploadPath = (value) => {
  if (!value || typeof value !== 'string') return '';

  const clean = value.trim().replace(/\\/g, '/');
  const uploadsIndex = clean.toLowerCase().lastIndexOf('/uploads/');

  if (uploadsIndex !== -1) return clean.slice(uploadsIndex);
  if (clean.toLowerCase().startsWith('uploads/')) return `/${clean}`;

  return clean;
};

const normalizeUploadPaths = (values) => {
  if (!values) return [];
  const list = Array.isArray(values) ? values : [values];
  return list.map(normalizeUploadPath).filter(Boolean);
};

module.exports = { normalizeUploadPath, normalizeUploadPaths };
