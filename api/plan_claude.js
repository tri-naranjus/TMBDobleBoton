import promptClaude from './prompt_plan_claude.js';

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

  const promptFinal = `${promptClaude}\n\nDatos del usuario:\n${datosUsuario}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1000,
        messages: [
  {
    role: "system",
    content: "Eres un nutricionista experto. Crea un menú personalizado según los datos que recibas."
  },
  {
    role: "user",
    content: promptFinal
  }
]
      }),
    });

    const data = await response.json();

    if (data?.content?.[0]?.text) {
      return res.status(200).json({ plan: data.content[0].text });
    } else {
      console.error("⚠️ Claude respondió mal:", data);
      return res.status(500).json({ error: "Respuesta inválida de Claude" });
    }
  } catch (error) {
    console.error("🔴 Error Claude:", error);
    return res.status(500).json({ error: error.message || "Error desconocido con Claude" });
  }
}
