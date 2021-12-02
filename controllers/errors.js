exports.statusMaintenance = (req, res, next) => {
  res.status(500).json({
    message: "The server is down for maintenance try again later",
  });
};
