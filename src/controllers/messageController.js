import { baseContext } from "../context/baseContext.js";
import { getGeminiReply } from "../services/geminiService.js";

export const handleIncomingMessage = async (req, res) => {
  let {
      sender,
      group_name,
      historyWithContext,
      history,
      MAX_CONTEXT_MESSAGES,
    } = req.body,
    reply = "";

  historyWithContext = [
    group_name
      ? baseContext.Group[0]
      : sender.indexOf("Mi Amor") > -1
      ? baseContext.PrivateAmor(sender)[0]
      : baseContext.Private(sender, history[1])[0],
    ...history[0],
  ];

  try {
    reply = await getGeminiReply(historyWithContext);
    console.log("🚀 ~ handleIncomingMessage ~ reply:", reply);
  } catch (err) {
    console.error("❌ Error llamando a Gemini:", err);
    return res.status(200).json({ reply: "" });
  }

  // Guardar respuesta del modelo
  history[0].push({ role: "model", content: reply });

  if (history[0].length > MAX_CONTEXT_MESSAGES)
    history[0].splice(0, history[0].length - MAX_CONTEXT_MESSAGES);

  // Número aleatorio entre 5 y 10 con hasta 3 decimales
  const segundos = +(Math.random() * (10 - 5) + 5).toFixed(3);

  // Convertir a milisegundos
  const milisegundos = Math.round(segundos * 1000);

  if (group_name) res.status(200).json({ reply: "" });
  else setTimeout(() => res.status(200).json({ reply }), milisegundos);
};
