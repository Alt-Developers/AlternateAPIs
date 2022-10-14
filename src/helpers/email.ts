import env from "dotenv";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import newError from "./newError";

env.config({ path: "./.env" });

console.table({
  user: process.env.mail_user,
  pass: process.env.mail_pass,
});

const transport = nodemailer.createTransport({
  host: "smtppro.zoho.com",
  port: 587,
  auth: {
    user: process.env.mail_user,
    pass: process.env.mail_pass,
  },
});

export const sentTokenEmail = (
  receiver: string,
  name: string,
  token: string
) => {
  console.log("Sending Email");
  ejs.renderFile(
    path.join(__dirname, "..", "..", "mail", "forgetPassword.ejs"),
    {
      email: receiver,
      token,
      name,
    },
    (err, data) => {
      if (err) return console.error(err);
      console.log("mailing " + receiver);

      const mailOptions = {
        from: "Alternate. <alternate@altdevelopers.dev>",
        to: receiver,
        subject: "Email Verification for Password recovery",
        html: data,
      };

      transport.sendMail(mailOptions, (err, data) => {
        if (err) console.log(err);
        console.log("Emailed " + receiver);
      });
    }
  );
};
