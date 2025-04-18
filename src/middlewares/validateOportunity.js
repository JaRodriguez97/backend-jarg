import { baseContext } from "../context/baseContext.js";
import { getGeminiReply } from "../services/geminiService.js";

const memory = new Map();

export const validateOportunity = async (req, res, next) => {
  const { app, sender, message, group_name, phone } = req.body;

  req.body.MAX_CONTEXT_MESSAGES = 6;

  const contextKey = group_name ? `group:${group_name}` : `user:${phone}`;

  req.body.contextKey = contextKey;

  if (!memory.has(contextKey)) memory.set(contextKey, []);

  req.body.history = memory.get(contextKey);

  // Añadir nuevo mensaje del usuario
  req.body.history.push({ role: "user", content: message });

  if (req.body.history.length > req.body.MAX_CONTEXT_MESSAGES) {
    req.body.history.splice(
      0,
      req.body.history.length - req.body.MAX_CONTEXT_MESSAGES
    );
  }

  if (!group_name) {
    req.body.historyWithContext = [
      sender == "Mi Amor ♥️"
        ? baseContext.PrivateAmor(sender)[0]
        : baseContext.Private(sender)[0],
      ...req.body.history,
    ];

    return next();
  }

  req.body.historyWithContext = [
    baseContext.ValidateOprtunityGroup[0],
    ...req.body.history,
  ];

  let reply = "";
  try {
    reply = await getGeminiReply(req.body.historyWithContext);
    // convert string to json
    reply = JSON.parse(reply);
    console.log("🚀 ~ validateOportunity ~ reply:", reply);

    if (reply.decision) return next();
    else return res.end();
  } catch (err) {
    console.error("❌ Error llamando a Gemini:", err);
    reply = "Lo siento, ocurrió un error generando la respuesta.";
    res.end();
  }
};
