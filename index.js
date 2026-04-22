const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = "8608628699:AAH2LbSFw6RwLLV3RVBPhjjL7EpN8aab9LI";
const SHEETS_URL = "https://script.google.com/macros/s/AKfycby0AlUj4UBqNjCqpUvNuPWFhy7nUnN2qFo0EAO-TuQCr5QoHEPQuofTZWgV6AuTDcYG/exec";

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo 🚀");
});
