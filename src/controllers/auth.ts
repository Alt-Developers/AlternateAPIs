import { Middleware } from "../models/types";

export const login: Middleware = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.pass;
  if (email && password) {
    return res.status(200).json({
      status: "LOGGEDIN",
      firstName: "Prawich",
      lastName: "Thawansakdivudhi",
      email: "prawich.th@gmail.com",
      img: "https://s.isanook.com/ga/0/rp/r/w728/ya0xa0m1w0/aHR0cHM6Ly9zLmlzYW5vb2suY29tL2dhLzAvdWQvMjIxLzExMDY5MzcvMTEwNjkzNy10aHVtYm5haWwuanBn.jpg",
      bio: "I'm prawich!",
    });
  }
  res.status(400).json({ message: "please enter valid account" });
};
