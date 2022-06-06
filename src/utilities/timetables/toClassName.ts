const specialPrefixes = {
  ENGPG: "EP",
  IGCSE: "Year",
  A_LVL: "Year",
  PREIG: "Year",
};

const specialDividers = {
  IGCSE: "-",
  A_LVL: "-",
  PREIG: "-",
  MOEPG: "-",
  SAPPG: "-",
};

const toClassName = ({
  school,
  program,
  year,
  classNo,
}: {
  school: string;
  program: string;
  year: string;
  classNo: string;
}): string => {
  const classPrefix: string = specialPrefixes[program] || "M";
  const divider: string = specialDividers[program] || "/";

  const className: string = `${classPrefix} ${year}${divider}${classNo}`;

  return className;
};

export default toClassName;
