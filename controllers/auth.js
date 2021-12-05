exports.login = (req, res, next) => {
  res.res.status(200).json({
    message: "You have successfully logged in",
  });
};
