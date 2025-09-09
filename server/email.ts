import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendTwoFactorCode(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: `"PC Asset Manager" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Il tuo codice di accesso a due fattori",
      html: `<p>Usa il seguente codice per completare il tuo accesso. Scade tra 10 minuti.</p><h2><strong>${code}</strong></h2>`,
    });
    console.log("Email 2FA inviata a:", email);
  } catch (error) {
    console.error("Errore nell'invio dell'email 2FA:", error);
    throw new Error("Impossibile inviare l'email con il codice.");
  }
}