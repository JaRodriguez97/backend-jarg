import {
  baseContextGroup,
  baseContextPrivate,
} from "../context/baseContext.js";
import { getGeminiReply } from "../services/geminiService.js";

const memory = new Map();
const MAX_CONTEXT_MESSAGES = 6;

const getContextKey = (phone, group_name) => {
  return group_name ? `group:${group_name}` : `user:${phone}`;
};

export const handleIncomingMessage = async (req, res) => {
  const { app, sender, message, group_name, phone } = req.body;
  console.log("🚀 ~ handleIncomingMessage ~ message:", message)

  const contextKey = getContextKey(phone, group_name);

  if (!memory.has(contextKey)) {
    memory.set(contextKey, []);
  }

  const history = memory.get(contextKey);

  // Añadir nuevo mensaje del usuario
  history.push({ role: "user", content: message });

  if (history.length > MAX_CONTEXT_MESSAGES) {
    history.splice(0, history.length - MAX_CONTEXT_MESSAGES);
  }

  // 🚀 Agregar contexto base + historial antes de enviar a Gemini
  const historyWithContext = [
    group_name ? baseContextGroup[0] : baseContextPrivate(sender)[0],
    ...history,
  ];

  let reply = "";
  try {
    reply = await getGeminiReply(historyWithContext);
    if (reply.trim() == "[0420!*2025*NO]") reply = "";
  } catch (err) {
    console.error("❌ Error llamando a Gemini:", err);
    reply = "Lo siento, ocurrió un error generando la respuesta.";
  }

  // Guardar respuesta del modelo
  history.push({ role: "model", content: reply });

  if (history.length > MAX_CONTEXT_MESSAGES) {
    history.splice(0, history.length - MAX_CONTEXT_MESSAGES);
  }

  return res.json({ reply });
};
