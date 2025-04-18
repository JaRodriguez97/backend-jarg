import { baseContext } from "../context/baseContext.js";
import { getGeminiReply } from "../services/geminiService.js";

export const handleIncomingMessage = async (req, res) => {
  const {
    app,
    sender,
    message,
    group_name,
    phone,
    contextKey,
    historyWithContext,
    history,
    MAX_CONTEXT_MESSAGES,
  } = req.body;

  let reply = "";

  if (group_name)
    historyWithContext = [baseContext.Group[0], ...req.body.history];

  try {
    reply = await getGeminiReply(historyWithContext);
  } catch (err) {
    console.error("❌ Error llamando a Gemini:", err);
    reply = "Lo siento, ocurrió un error generando la respuesta.";
    return res.end();
  }

  // Guardar respuesta del modelo
  history.push({ role: "model", content: reply });

  if (history.length > MAX_CONTEXT_MESSAGES)
    history.splice(0, history.length - MAX_CONTEXT_MESSAGES);

  setTimeout(() => res.status(200).json({ reply }), 3000);
};
