function requireStudent(req, res, next) {
  if (!req.session || !req.session.studentId) {
    return res.status(401).json({
      error: 'Authentication required.',
      message: 'Log in with a valid student account before accessing this resource.'
    });
  }

  return next();
}

module.exports = requireStudent;
