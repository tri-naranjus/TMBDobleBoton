export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    edad, peso, altura, sexo, GET, objetivo,
    tipoEntreno, horaEntreno, intensidad, duracion, intolerancias
  } = req.body;

  const datosUsuario = `
EDAD: ${edad}
PESO: ${peso}
ALTURA: ${altura}
SEXO: ${sexo}
GET según objetivo: ${GET} kcal
OBJETIVO: ${objetivo}

ENTRENAMIENTO:
- Tipo: ${tipoEntreno}
- Hora: ${horaEntreno}
- Intensidad: ${intensidad}
- Duración: ${duracion} minutos

INTOLERANCIAS: ${intolerancias?.join(', ') || 'Ninguna'}
`;

  try {
    const assistantId = "asst_EoXmMOlc4BvPgysPIWYR0mri";

    // 1. Crear un nuevo hilo (thread)
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const thread = await threadRes.json();

    // 2. Añadir mensaje del usuario
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user",
        content: datosUsuario
      })
    });

    // 3. Lanzar la ejecución
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    const run = await runRes.json();

    // 4. Esperar la respuesta (polling)
    let status = run.status;
    let output;

    while (status !== "completed" && status !== "failed" && status !== "cancelled") {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const checkRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v1"
        }
      });

      const updated = await checkRes.json();
      status = updated.status;
    }

    if (status === "completed") {
      const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v1"
        }
      });

      const messages = await messagesRes.json();
      const lastMessage = messages.data.find(msg => msg.role === "assistant");

      return res.status(200).json({ plan: lastMessage?.content?.[0]?.text || "❌ Sin respuesta del modelo." });
    } else {
      return res.status(500).json({ error: "La ejecución del assistant falló o fue cancelada." });
    }
  } catch (error) {
    console.error("🔴 Error Assistant:", error);
    return res.status(500).json({ error: error.message || "Error desconocido con Assistant." });
  }
}

