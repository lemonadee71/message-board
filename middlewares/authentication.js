const isAlreadyLoggedIn = (req, res, next) => {
  if (req.user && req.isAuthenticated()) {
    res.redirect('/');
  } else {
    next();
  }
};

const isLoggedIn = (req, res, next) => {
  if (req.user && req.isAuthenticated()) {
    next();
  } else {
    req.flash('warning', 'You must be logged in to continue');
    res.redirect('/login');
  }
};

module.exports = { isAlreadyLoggedIn, isLoggedIn };
