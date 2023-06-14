import { createTransport } from "nodemailer";

const email = process.env.EMAIL;
const pass = process.env.PASS;

export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
});
