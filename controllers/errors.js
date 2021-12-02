exports.statusMaintenance = (req, res, next) => {
  res.status(503).json({
    message: "The server is down for maintenance try again later",
  });
};
