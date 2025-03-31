import React, { useState } from "react";

const PlanNutricionalEntreno = () => {
  const [sexo, setSexo] = useState("mujer");
  const [edad, setEdad] = useState(30);
  const [peso, setPeso] = useState(60);
  const [objetivo, setObjetivo] = useState("definicion");
  const [tipoEntreno, setTipoEntreno] = useState("fuerza");
  const [horaEntreno, setHoraEntreno] = useState("18:00");
  const [intensidad, setIntensidad] = useState("media");

  const [plan, setPlan] = useState("");
  const [prompt, setPrompt] = useState("");

  const generarPlan = async () => {
    const promptGenerado = `
Eres un nutricionista experto en fisiología y nutrición.

Datos del usuario:
- Sexo: ${sexo}
- Edad: ${edad}
- Peso: ${peso} kg
- Objetivo: ${objetivo}

Entrenamiento de hoy:
- Tipo: ${tipoEntreno}
- Hora: ${horaEntreno}
- Intensidad: ${intensidad}

Genera un plan nutricional detallado para hoy, adaptado al entrenamiento, respetando el objetivo y señalando los momentos de ingesta.
`;

    setPrompt(promptGenerado); // ✅ mostramos el prompt

    try {
      const response = await fetch("/api/generar-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptGenerado }),
      });

      const data = await response.json();
      setPlan(data.resultado);
    } catch (error) {
      setPlan("Error al generar el plan");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Plan Nutricional según tu Entreno 🥦</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
          <option value="mujer">Mujer</option>
          <option value="hombre">Hombre</option>
        </select>
        <input
          type="number"
          value={edad}
          onChange={(e) => setEdad(Number(e.target.value))}
          placeholder="Edad"
        />
        <input
          type="number"
          value={peso}
          onChange={(e) => setPeso(Number(e.target.value))}
          placeholder="Peso (kg)"
        />
        <select value={objetivo} onChange={(e) => setObjetivo(e.target.value)}>
          <option value="definicion">Definición</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="superavit">Superávit</option>
        </select>
        <select value={tipoEntreno} onChange={(e) => setTipoEntreno(e.target.value)}>
          <option value="fuerza">Fuerza</option>
          <option value="resistencia">Resistencia</option>
          <option value="mixto">Mixto</option>
        </select>
        <input
          type="time"
          value={horaEntreno}
          onChange={(e) => setHoraEntreno(e.target.value)}
        />
        <select value={intensidad} onChange={(e) => setIntensidad(e.target.value)}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      <button
        onClick={generarPlan}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        Generar plan
      </button>

      {plan && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-bold text-gray-800 mb-2">📋 Plan generado:</h3>
          <p className="whitespace-pre-wrap text-gray-700">{plan}</p>
        </div>
      )}

      {prompt && (
        <div className="mt-6 bg-gray-100 p-4 rounded-md">
          <h3 className="font-bold mb-2 text-gray-700">🧠 Prompt enviado a la IA:</h3>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">{prompt}</pre>
        </div>
      )}
    </div>
  );
};

export default PlanNutricionalEntreno;



