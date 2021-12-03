exports.statusMaintenance = (req, res, next) => {
  console.log(`A request has been rejected from the server [500]`);
  res.status(503).json({
    message: "The server is down for maintenance try again later",
    reason: "maintenance",
  });
};
