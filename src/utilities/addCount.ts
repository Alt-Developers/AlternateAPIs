import Count from "../models/system13/count";
import { Count as CountTypes } from "../models/types/modelType";

export default function addCount(apiName: string) {
  Count.findOne({ apiName: apiName }).then((api: any) => {
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
