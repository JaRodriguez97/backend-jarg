import { baseContext } from "../context/baseContext.js";
import { getGeminiReply } from "../services/geminiService.js";

const memory = new Map();

export const validateOportunity = async (req, res, next) => {
  const { sender, message, group_name, phone } = req.body;

  req.body.MAX_CONTEXT_MESSAGES = 12;

  const contextKey = group_name ? `group:${group_name}` : `user:${phone}`;

  req.body.contextKey = contextKey;

  if (!memory.has(contextKey)) memory.set(contextKey, [[], 0]);

  req.body.history = memory.get(contextKey);

  if (!group_name && req.body.history[1] == 1)
    return res.status(200).json({ reply: "" });

  // Añadir nuevo mensaje del usuario
  req.body.history[0].push({ role: "user", content: message });

  if (req.body.history[0].length > req.body.MAX_CONTEXT_MESSAGES) {
    req.body.history[0].splice(
      0,
      req.body.history.length - req.body.MAX_CONTEXT_MESSAGES
    );
  }

  req.body.historyWithContext = [
    group_name
      ? baseContext.ValidateOprtunityGroup[0]
      : baseContext.ValidateOprtunityPrivate[0],
    ...req.body.history[0],
  ];

  try {
    let reply = await getGeminiReply(req.body.historyWithContext);

    reply = reply
      .replace(/```json\s*/, "") // elimina ```json y posibles espacios/líneas
      .replace(/```/, "") // elimina la marca de cierre ```
      .trim();

    // Validamos que sea un objeto JSON antes de parsear
    if (!esObjetoJSON(reply)) {
      console.error(
        "❌ La respuesta de Gemini no es un objeto JSON válido:",
        reply
      );
      return res.status(200).send({ reply: "" });
    }

    reply = JSON.parse(reply);

    req.body.history[1] = reply.asesor;

    if (reply.decision) return next();
    else return res.status(200).send({ reply: "" });
  } catch (err) {
    console.error("❌ Error llamando a Gemini:", err);
    res.status(200).send({ reply: "" });
  }
};

function esObjetoJSON(str) {
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed);
  } catch {
    return false;
  }
}
