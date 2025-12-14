const validate = (schema) => async (req, res, next) => {
  try {
    if (!schema) return next();
    const value = await schema.validateAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    }, { abortEarly: false });
    req.validated = value;
    return next();
  } catch (err) {
    return res.status(400).json({ message: 'Validation error', details: err.details });
  }
};

module.exports = { validate };
