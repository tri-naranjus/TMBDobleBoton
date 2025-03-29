
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se permiten solicitudes POST' });
  }

  const { edad, peso, altura, sexo, GET, tipoEntreno, horaEntreno, intensidad, duracion, intolerancias } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Falta la API Key de OpenAI' });
  }

  const promptSistema = `Eres un nutricionista experto en fisiología y rendimiento deportivo. Tu misión es dar un menú diario al deportista en función del entrenamiento que tenga ese día.

  Instrucciones:
  - La comida es normocalórica según el GET. Si quiere ganar peso, que coma un poco más. Si quiere perder, un poco menos.
  - Las recomendaciones girarán siempre alrededor del entrenamiento del día y su horario.

  Datos recogidos:
  - Edad: ${edad}
  - Peso: ${peso} kg
  - Altura: ${altura} cm
  - Sexo: ${sexo}
  - Gasto energético total (GET): ${GET} kcal
  - Tipo de entrenamiento: ${tipoEntreno}
  - Hora del entrenamiento: ${horaEntreno}
  - Intensidad del entrenamiento: ${intensidad}
  - Duración del entrenamiento: ${duracion} minutos
  - Intolerancias o alimentos a evitar: ${intolerancias.join(", ")}

  Pide una dieta diaria que incluya:
  1. Breve explicación inicial de cómo está ajustada la dieta.
  2. Distribución horaria de las comidas según el entrenamiento.
  3. Justificación fisiológica de cada comida (estado hormonal, rutas energéticas, etc.).
  4. Tabla final de macros (proteínas, grasas, CH).
  5. Suplementos si procede.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: promptSistema },
        ],
        temperature: 0.8,
        max_tokens: 1800,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({ plan: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ error: 'Error al generar el plan nutricional' });
  }
}
