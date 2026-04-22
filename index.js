const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = "TU_TOKEN_AQUI";
const SHEETS_URL = "TU_URL_DE_APPS_SCRIPT";

app.post(`/bot${TELEGRAM_TOKEN}`, async (req, res) => {
  const msg = req.body.message?.text;
  const chatId = req.body.message?.chat?.id;

  if (!msg) return res.sendStatus(200);

  const regex = /(gasto|ingreso)\s(\d+)\s(\w+)\s(.+)/i;
  const match = msg.match(regex);

  if (!match) {
    await enviarMensaje(chatId, "Formato inválido ❌\nEjemplo:\ngasto 15000 comida almuerzo");
    return res.sendStatus(200);
  }

  const [, tipo, valor, categoria, descripcion] = match;

  await axios.post(SHEETS_URL, {
    tipo,
    valor,
    categoria,
    descripcion
  });

  await enviarMensaje(chatId, `✅ ${tipo} registrado:\n$${valor} - ${categoria}`);

  res.sendStatus(200);
});

async function enviarMensaje(chatId, texto) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: texto
  });
}

app.listen(3000, () => console.log("Bot corriendo 🚀"));