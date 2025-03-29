import fs from 'fs';
import path from 'path';
import promptTemplate from './prompt_plan.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { edad, peso, altura, sexo, GET, objetivo, tipoEntreno, horaEntreno, intensidad, duracion, intolerancias } = req.body;

  const promptPath = path.join(process.cwd(), 'src/api/prompt_plan.txt');
  const promptTemplate = fs.readFileSync(promptPath, 'utf8');

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
- Duración: ${duracion} min

INTOLERANCIAS: ${intolerancias?.join(', ') || 'Ninguna'}
`;

  const promptFinal = `${promptTemplate}\n\nDatos del usuario:\n${datosUsuario}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY1}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un nutricionista experto en fisiología y rendimiento deportivo. SIGUE LAS SIGUIENTES INSTRUCCIONES AL PIE DE LA LETRA, MUESTRA LA DIETA EN FORMATO TABLA" },
          { role: "user", content: promptFinal },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      return res.status(200).json({ plan: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: "Respuesta inválida del modelo" });
    }
  } catch (error) {
    console.error("🔴 Error GPT:", error);
    return res.status(500).json({ error: error.message || "Error desconocido" });
  }
}
