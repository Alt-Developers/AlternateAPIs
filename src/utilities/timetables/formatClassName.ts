const formatClassName = (
  classCode: string[] | string,
  lang: "TH" | "EN" | string,
  formattedFormat: any
) => {
  if (Array.isArray(classCode)) {
    return classCode.map(
      (cur) =>
        //@ts-ignore
        formattedFormat.classCode[lang][cur]
    );
  } else {
    return formattedFormat.classCode[lang][classCode];
  }
};

export default formatClassName;
