import { Middleware } from "../models/types";

export const login: Middleware = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.pass;
  if (email && password) {
    return res.status(200).json({
      status: "LOGGEDIN",
      name: "Prawich Thawansakdivudhi",
      email: "prawich.th@gmail.com",
      img: "https://yt3.ggpht.com/ytc/AKedOLQnp52grHdSYHky8B9cw3EqZxTX7kK8grKXmbXY8A=s176-c-k-c0x00ffffff-no-rj",
      bio: "I'm prawich!",
    });
  }
  res.status(400).json({ message: "please enter valid account" });
};
