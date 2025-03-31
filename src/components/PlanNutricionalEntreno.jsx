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
    setCargando(false);

    if (data?.plan) {
      setPlanGenerado(data.plan);
      setPromptUsado(data.prompt); // Mostramos el prompt usado
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
  <pre className="mt-2 text-sm text-gray-700">
    {promptUsado || "⚠️ No se recibió el prompt."}
  </pre>
</details>
          )}
        </div>
      )}
    </div>
  );
}


