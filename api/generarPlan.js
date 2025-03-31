// ✅ Archivo 1: /api/generarPlan.js (usando Assistant API)


console.log("🚀 Ejecutando función generarPlan()");
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

    let status = run.status;
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

      return res.status(200).json({ plan: lastMessage?.content?.[0]?.text || "❌ Sin respuesta del modelo.", prompt: datosUsuario });
    } else {
      return res.status(500).json({ error: "La ejecución del assistant falló o fue cancelada." });
    }
  } catch (error) {
    console.error("🔴 Error Assistant:", error);
    return res.status(500).json({ error: error.message || "Error desconocido con Assistant." });
  }
}


// ✅ Archivo 2: PlanNutricionalEntreno.jsx (frontend React con prompt mostrado)

import { useState } from "react";

export default function PlanNutricionalEntreno({ GET, peso, edad, altura, sexo, objetivo }) {
  const [horaEntreno, setHoraEntreno] = useState("");
  const [tipoEntreno, setTipoEntreno] = useState("");
  const [intensidad, setIntensidad] = useState("");
  const [duracion, setDuracion] = useState("");
  const [intoleranciasSeleccionadas, setIntoleranciasSeleccionadas] = useState([]);
  const [planGenerado, setPlanGenerado] = useState(null);
  const [promptUsado, setPromptUsado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const generarPlan = async () => {
    setCargando(true);
    setPlanGenerado(null);

    const response = await fetch("/api/generarPlan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        edad, peso, altura, sexo, GET, objetivo,
        tipoEntreno, horaEntreno, intensidad, duracion,
        intolerancias: [...intoleranciasSeleccionadas]
      })
    });

    const data = await response.json();

// 👇 Añade estas dos líneas:
console.log("📥 Plan:", data.plan);
console.log("📦 Prompt:", data.prompt);

setCargando(false);

if (data?.plan) {
  setPlanGenerado(data.plan);
  setPromptUsado(data.prompt); // Guardamos el prompt
} else {
  setPlanGenerado("❌ Error al generar el plan.");
}
    setCargando(false);

    if (data?.plan) {
      setPlanGenerado(data.plan);
      setPromptUsado(data.prompt); // Muestra el prompt usado
    } else {
      setPlanGenerado("❌ Error al generar el plan.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎯 Plan Nutricional Diario</h2>
      <button onClick={generarPlan} className="bg-orange-500 text-white px-4 py-2 rounded-xl">
        🍽️ Generar Plan Diario
      </button>

      {cargando && <p className="mt-4">⏳ Generando...</p>}

      {planGenerado && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
          <h3 className="text-xl font-bold mb-2">🍽️ Resultado</h3>
          <p>{planGenerado}</p>

          {promptUsado && (
            <details className="mt-6 bg-white p-4 border border-orange-200 rounded-lg">
              <summary className="cursor-pointer font-semibold text-orange-600">
                🔍 Ver prompt usado
              </summary>
              <pre className="mt-2 text-sm text-gray-700">{promptUsado}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

