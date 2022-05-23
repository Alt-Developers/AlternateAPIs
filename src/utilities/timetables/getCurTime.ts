export default () => {
  let curTime = 0;
  let curDay = "monday";
  let curWeekDay = 0;

  const now = new Date();
  const day = now.getDay();
  const advanceTime = +`${now.getHours()}${
    (now.getMinutes() < 10 ? "0" : "") + now.getMinutes()
  }${(now.getSeconds() < 10 ? "0" : "") + now.getSeconds()}`;
  curTime = +`${now.getHours()}${
    (now.getMinutes() < 10 ? "0" : "") + now.getMinutes()
  }`;
  curWeekDay = day;
  if (day === 1) curDay = "monday";
  if (day === 2) curDay = "tuesday";
  if (day === 3) curDay = "wednesday";
  if (day === 4) curDay = "thursday";
  if (day === 5) curDay = "friday";

  if (day === 6 || day === 0) curDay = "weekend";
  // console.log({ curDay, day });

  return {
    curTime: 850,
    curDay,
    curWeekDay,
  };
};
