import newError from "../newError";
export const schoolTimetables = {
  NEWTON: [
    900, 930, 1000, 1030, 1100, 1130, 1300, 1330, 1400, 1430, 1500, 1530, 1600,
    1630, 1700, 1730,
  ],
  BNEWTON: [1200, 1300],
  ESSENCE: [900, 1000, 1100, 1300, 1400, 1500, 1600],
  ESSENCEP: [900, 1015, 1030, 1245, 1400, 1415, 1530],
  BESSENCEP: [1145, 1245],
  ASSUMPTION: [830, 920, 1020, 1210, 1300, 1400, 1450, 1540],
  BASSUMPTION: [1110, 1210],
  BESSENCE: [1200, 1300],
};

export default (time: number, school: string) => {
  let classIndex: number = -1;
  let nextClassIndex: number = -1;

  if (
    school !== "NEWTON" &&
    school !== "ESSENCE" &&
    school !== "ASSUMPTION" &&
    school !== "ESSENCEP"
  ) {
    return newError(
      500,
      "Internal Server Error|Please Contact System Administrator CODE[IDFCC001]",
      "prompt"
    );
  }
  let isConditional = false;
  schoolTimetables[school].forEach((cur, index, arr) => {
    // console.log({
    //   index,
    //   cur,
    //   arr,
    //   time,
    //   isThis: cur <= time && time <= arr[index + 1],
    // });
    if (cur <= time && time < arr[index + 1]) {
      classIndex = index;
      nextClassIndex = index + 1;
      return;
    } else if (
      time > schoolTimetables[school][schoolTimetables[school].length - 1]
    ) {
      classIndex = -2;
      nextClassIndex = -2;
      isConditional = true;
      return;
    } else if (time < schoolTimetables[school][0]) {
      classIndex = -1;
      nextClassIndex = 0;
      isConditional = true;

      return;
    } else if (
      schoolTimetables.BNEWTON[0] <= time &&
      time < schoolTimetables.BNEWTON[1] &&
      school === "NEWTON"
    ) {
      classIndex = -70;
      nextClassIndex = 6;
      isConditional = true;
      return;
    } else if (
      schoolTimetables.BASSUMPTION[0] <= time &&
      time < schoolTimetables.BASSUMPTION[1] &&
      school === "ASSUMPTION"
    ) {
      classIndex = -70;
      nextClassIndex = 4;
      isConditional = true;
      return;
    } else if (
      schoolTimetables.BESSENCE[0] <= time &&
      time < schoolTimetables.BESSENCE[1] &&
      school === "ESSENCE"
    ) {
      classIndex = -70;
      nextClassIndex = 4;
      isConditional = true;
      return;
    } else if (
      schoolTimetables.BESSENCEP[0] <= time &&
      time < schoolTimetables.BESSENCEP[1] &&
      school === "ESSENCEP"
    ) {
      classIndex = -70;
      nextClassIndex = 4;
      isConditional = true;
    } else if (!arr[classIndex + 1] && cur && !isConditional) {
      // console.log("curClass: ", arr[index]);
      classIndex = arr.findIndex((cur) => cur === arr[arr.length - 1]);
      nextClassIndex = 10000;
    }
  });
  // console.log({ classIndex, nextClassIndex });
  return { classIndex, nextClassIndex };
};
