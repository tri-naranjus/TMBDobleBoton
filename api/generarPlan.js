export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { edad, peso, altura, sexo, GET, objetivo, tipoEntreno, horaEntreno, intensidad, duracion, intolerancias } = req.body;

  const prompt = `
Eres un nutricionista experto en fisiología y rendimiento deportivo. Tu misión es dar un menú diario al deportista según el entrenamiento que tenga ese día. Explica que la comida es normocalórica, y que si quiere ganar peso debe comer algo más, y si quiere perder, algo menos.

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

Diseña un menú de 4–5 comidas alineado con la fisiología hormonal circadiana, ajustando timing y macronutrientes en torno al entrenamiento. Ten en cuenta el tipo de ejercicio y la franja horaria para definir qué alimentos y en qué momentos del día se aprovechan mejor.

Al final, muestra una tabla con:
- Los macros aproximados por comida
- El estado hormonal (insulina, cortisol, GH...) en cada tramo horario
- Una recomendación opcional de suplementación
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY1}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Eres un nutricionista experto en fisiología y rendimiento deportivo." },
          { role: "user", content: prompt },
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
    return res.status(500).json({ error: "Error al generar el plan nutricional" });
  }
}

