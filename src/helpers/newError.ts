let modalType = ["validation", "user", "important", "general"];

const newError = (
  code: number,
  msg: string,
  type?: string,
  validationLocation?: string
) => {
  if (!msg.endsWith("." || "!" || "?")) {
    msg = `${msg}.`;
  }

  const error = new Error(msg);
  error.statusCode = code;
  error.type = type || "general";
  error.location = validationLocation;

  if (modalType.includes(error.type)) error.modal = true;

  throw error;
};

export default newError;
