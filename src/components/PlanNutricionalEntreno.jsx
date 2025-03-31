import React, { useState } from "react";

const PlanNutricionalEntreno = () => {
  const [plan, setPlan] = useState("");
  const [prompt, setPrompt] = useState("");

  const generarPlan = async () => {
    const promptGenerado = `
Eres un nutricionista experto en fisiología deportiva.

Crea un plan nutricional diario completo, basado en:

- Objetivo: mantenimiento
- Tipo de entrenamiento: HIIT/CrossFit
- Intensidad: alta
- Horario del entreno: tarde (18:00)
- GET estimado: 2400 kcal
- Macronutrientes: 140g proteína, 70g grasa, 280g carbohidratos

Incluye todas las comidas del día, con cantidades aproximadas y ejemplos concretos. Añade opciones pre y post entrenamiento. Usa un tono motivador, profesional y claro.
`;

    setPrompt(promptGenerado); // ← Guardamos el prompt para mostrarlo

    try {
      const response = await fetch("/api/generarPlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptGenerado }),
      });

      const data = await response.json();
      setPlan(data.resultado);
    } catch (error) {
      setPlan("❌ Error al generar el plan");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">🍊 Plan Nutricional Diario</h2>

      <button
        onClick={generarPlan}
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
      >
        Generar plan
      </button>

      {plan && (
        <div className="mt-8 bg-green-50 p-4 rounded-md border border-green-300">
          <h3 className="font-semibold text-green-800 mb-2">✅ Plan generado:</h3>
          <pre className="whitespace-pre-wrap text-sm text-green-900">{plan}</pre>
        </div>
      )}

      {prompt && (
        <div className="mt-6 bg-gray-100 p-4 rounded-md border border-gray-300">
          <h3 className="font-semibold text-gray-800 mb-2">🧠 Prompt enviado a ChatGPT:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{prompt}</pre>
        </div>
      )}
    </div>
  );
};

export default PlanNutricionalEntreno;
