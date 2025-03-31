import React, { useState } from "react";

const PlanNutricionalEntreno = () => {
  const [plan, setPlan] = useState("");
  const [prompt, setPrompt] = useState("");

  const generarPlan = async () => {
    const promptGenerado = `
Eres un nutricionista experto en fisiología.

Datos del usuario:
- Sexo: mujer
- Edad: 30
- Peso: 60 kg
- Objetivo: definición

Entrenamiento de hoy:
- Tipo: fuerza
- Hora: 18:00
- Intensidad: media

Genera un plan nutricional detallado para hoy, adaptado al entrenamiento.
`;

    setPrompt(promptGenerado); // 👈 Esto es lo que queremos ver en pantalla

    // Simula un plan generado
    setPlan("Desayuno: ...\nComida: ...\nCena: ...");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🧪 Test: Ver Prompt</h2>

      <button
        onClick={generarPlan}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generar plan
      </button>

      {plan && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h3 className="font-bold mb-2">📋 Plan generado:</h3>
          <pre className="whitespace-pre-wrap text-sm">{plan}</pre>
        </div>
      )}

      {prompt && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2 text-gray-800">🧠 Prompt enviado a la IA:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{prompt}</pre>
        </div>
      )}
    </div>
  );
};

export default PlanNutricionalEntreno;



