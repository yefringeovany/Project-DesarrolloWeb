import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req,res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error:"No se proporcionó texto" });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error:"API Key de OpenAI no definida" });

  try {
    console.log("💬 Texto recibido para TTS:", text);

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.set('Content-Type','audio/mpeg');
    res.send(audioBuffer);

    console.log("✅ Audio generado con éxito, bytes:", audioBuffer.byteLength);

  } catch(err) {
    console.error("❌ Error generando TTS OpenAI:", err.message||err);
    res.status(500).json({ error:"Error generando TTS", detalle: err.message||err });
  }
});

export default router;
