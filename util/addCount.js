const Count = require("../models/count");

function addCount(apiName) {
  Count.findOne({ apiName: "getPlayerList" })
    .then((api) => {
      if (api) {
        console.log(api);
        api.count += 1;
        return api.save();
      }
      const newApi = new Count({
        apiName: "getPlayerList",
        count: 1,
      });
      return newApi.save();
    })
    .catch((err) => {
      next(new Error(err));
    });
}

module.exports = addCount;
