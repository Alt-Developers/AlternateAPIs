import formatClassName from "./formatClassName";
import { schoolTimetables } from "./identifyCurClass";

const days = [
  "weekend",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "weekend",
  "monday",
];

const bookToAdd = (
  now: { curWeekDay: number; curTime: number },
  lang: string,
  formattedFormat: any,
  timetableData: any
) => {
  const lastPeriodTime: number =
    // @ts-ignore
    schoolTimetables[timetableData.school].at(-1);

  if (now.curTime > lastPeriodTime) {
    const today =
      days[now.curWeekDay] === "weekend" ? "friday" : days[now.curWeekDay];

    const realYesterday = days[now.curWeekDay - 1] || "weekend";

    const yesterday = realYesterday === "weekend" ? "friday" : realYesterday;

    const realTmrDay = days[now.curWeekDay + 1] || "weekend";

    const tmrDay = realTmrDay === "weekend" ? "monday" : realTmrDay;

    const alrInBag =
      // @ts-ignore
      [
        ...new Set(
          // @ts-ignore
          timetableData.timetableContent[today]
        ),
      ];

    const toAdd: any =
      //@ts-ignore
      [
        ...new Set(
          // @ts-ignore
          timetableData.timetableContent[tmrDay]
        ),
      ];

    const toRemove: any = formatClassName(
      // @ts-ignore
      [
        ...new Set(
          // @ts-ignore
          timetableData.timetableContent[today]
        ),
      ].filter((cur: any) => {
        return !toAdd.includes(cur);
      }),
      lang,
      formattedFormat
    );

    const finalToAdd: { name: any; icon: any; status: any }[] = [];
    const finalAlrInBag: { name: any; icon: any; status: any }[] = [];

    for (const className of toAdd) {
      const formattedPeriod = formatClassName(className, lang, formattedFormat);

      if (alrInBag.includes(className)) {
        finalAlrInBag.push({
          name: formattedPeriod.name,
          icon: formattedPeriod.icon,
          status: alrInBag.includes(className) ? "inBag" : "toAdd",
        });
      } else {
        finalToAdd.push({
          name: formattedPeriod.name,
          icon: formattedPeriod.icon,
          status: alrInBag.includes(className) ? "inBag" : "toAdd",
        });
      }
    }

    return { toAdd: finalToAdd, toRemove: toRemove, alrInBag: finalAlrInBag };
  } else {
    const today =
      days[now.curWeekDay] === "weekend" ? "monday" : days[now.curWeekDay];

    const realYesterday = days[now.curWeekDay - 1] || "weekend";

    const yesterday = realYesterday === "weekend" ? "friday" : realYesterday;

    const realTmrDay = days[now.curWeekDay + 1] || "weekend";

    const tmrDay = realTmrDay === "weekend" ? "monday" : realTmrDay;

    const alrInBag =
      // @ts-ignore
      [
        ...new Set(
          // @ts-ignore
          timetableData.timetableContent[yesterday]
        ),
      ];

    const toAdd: any =
      //@ts-ignore
      [
        ...new Set(
          // @ts-ignore
          timetableData.timetableContent[today]
        ),
      ];

    const toRemove: any = formatClassName(
      // @ts-ignore
      [
        ...new Set(
          // @ts-ignore
          timetableData.timetableContent[yesterday]
        ),
      ].filter((cur: any) => {
        return !toAdd.includes(cur);
      }),
      lang,
      formattedFormat
    );

    const finalToAdd: { name: any; icon: any; status: any }[] = [];
    const finalAlrInBag: { name: any; icon: any; status: any }[] = [];

    for (const className of toAdd) {
      const formattedPeriod = formatClassName(className, lang, formattedFormat);

      if (alrInBag.includes(className)) {
        finalAlrInBag.push({
          name: formattedPeriod.name,
          icon: formattedPeriod.icon,
          status: alrInBag.includes(className) ? "inBag" : "toAdd",
        });
      } else {
        finalToAdd.push({
          name: formattedPeriod.name,
          icon: formattedPeriod.icon,
          status: alrInBag.includes(className) ? "inBag" : "toAdd",
        });
      }
    }
    return { toAdd: finalToAdd, toRemove: toRemove, alrInBag: finalAlrInBag };
  }
};

export default bookToAdd;
