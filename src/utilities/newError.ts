const newError = (code: number, msg: string) => {
  if (!msg.endsWith("." || "!" || "?")) {
    msg = `${msg}.`;
  }
  const error = new Error(msg);
  error.statusCode = code;
  console.log(`Error: ${error.message} - Status: ${error.statusCode}`);
  throw error;
};

export default newError;
