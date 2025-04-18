import { baseContext } from "../context/baseContext.js";
import { getGeminiReply } from "../services/geminiService.js";

export const handleIncomingMessage = async (req, res) => {
  let {
      app,
      sender,
      message,
      group_name,
      phone,
      contextKey,
      historyWithContext,
      history,
      MAX_CONTEXT_MESSAGES,
    } = req.body,
    reply = "";

  if (group_name)
    historyWithContext = [baseContext.Group[0], ...req.body.history];

  try {
    reply = await getGeminiReply(historyWithContext);
  } catch (err) {
    console.error("❌ Error llamando a Gemini:", err);
    return res.status(204).end();
  }

  // Guardar respuesta del modelo
  history.push({ role: "model", content: reply });

  if (history.length > MAX_CONTEXT_MESSAGES)
    history.splice(0, history.length - MAX_CONTEXT_MESSAGES);

  // Número aleatorio entre 5 y 10 con hasta 3 decimales
  const segundos = +(Math.random() * (10 - 5) + 5).toFixed(3);

  // Convertir a milisegundos
  const milisegundos = Math.round(segundos * 1000);

  return res.status(204).end();
  setTimeout(() => res.status(200).json({ reply }), milisegundos);
};
