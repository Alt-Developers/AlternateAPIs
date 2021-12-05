import Count from "../models/count";

function addCount(apiName: string) {
  Count.findOne({ apiName: apiName }).then((api) => {
    if (api) {
      api.count += 1;
      return api.save();
    }
    const newApi = new Count({
      apiName: apiName,
      count: 1,
    });
    return newApi.save();
  });
}
