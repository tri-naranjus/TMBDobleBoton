
import React, { useState } from 'react';

const actividadFactor = {
  'Sedentario': [1.1, 1.2, 1.2, 1.3, 1.4, 1.5, 1.5, 1.5],
  'Ligeramente activo': [1.2, 1.4, 1.4, 1.5, 1.6, 1.7, 1.7, 1.7],
  'Activo': [1.4, 1.6, 1.6, 1.7, 1.8, 1.9, 1.9, 1.9],
  'Muy activo': [1.5, 1.8, 1.8, 1.9, 2.0, 2.1, 2.1, 2.1]
};

const objetivosMacros = {
  "Definir": { prot: 2.2, grasa: 0.8 },
  "Mantener": { prot: 1.8, grasa: 1.0 },
  "Ganar masa": { prot: 2.0, grasa: 1.1 }
};

export default function CalculadoraTMB() {
  const [sexo, setSexo] = useState('Hombre');
  const [edad, setEdad] = useState(50);
  const [peso, setPeso] = useState(71);
  const [altura, setAltura] = useState(175);
  const [actividad, setActividad] = useState('Sedentario');
  const [diasEntreno, setDiasEntreno] = useState(7);
  const [objetivo, setObjetivo] = useState('Mantener');
  const [resultados, setResultados] = useState(null);

  const calcular = () => {
    const pesoF = parseFloat(peso);
    const alturaF = parseFloat(altura);
    const edadF = parseFloat(edad);

    let hb, owen, mifflin;

    if (sexo === 'Hombre') {
      hb = 88.36 + (13.4 * pesoF) + (4.8 * alturaF) - (5.7 * edadF);
      owen = 879 + (10.2 * pesoF);
      mifflin = (10 * pesoF) + (6.25 * alturaF) - (5 * edadF) + 5;
    } else {
      hb = 447.6 + (9.2 * pesoF) + (3.1 * alturaF) - (4.3 * edadF);
      owen = 795 + (7.18 * pesoF);
      mifflin = (10 * pesoF) + (6.25 * alturaF) - (5 * edadF) - 161;
    }

    const tmb = (hb + owen + mifflin) / 3;
    const factor = actividadFactor[actividad][diasEntreno];
    const getSinTermogenesis = tmb * factor;
    const termogenesis = getSinTermogenesis * 0.10;
    const get = getSinTermogenesis + termogenesis;

    const deficit = get - 400 < 0 ? get - 400 : get * 0.85;
    const superavitConservador = get + 350;
    const superavitModerado = get + 500;
    const superavitAlto = get + 700;

    const calObjetivo = objetivo === 'Definir' ? deficit : objetivo === 'Mantener' ? get : superavitModerado;
    const { prot, grasa } = objetivosMacros[objetivo];
    const proteinas = pesoF * prot;
    const grasas = pesoF * grasa;
    const kcalProteinas = proteinas * 4;
    const kcalGrasas = grasas * 9;
    const kcalCarbs = calObjetivo - kcalProteinas - kcalGrasas;
    const carbohidratos = kcalCarbs / 4;

    setResultados({
      tmb: tmb.toFixed(0),
      get: get.toFixed(0),
      deficit: Math.round(deficit),
      superavitConservador: Math.round(superavitConservador),
      superavitModerado: Math.round(superavitModerado),
      superavitAlto: Math.round(superavitAlto),
      objetivo,
      kcal: Math.round(calObjetivo),
      proteinas: Math.round(proteinas),
      grasas: Math.round(grasas),
      carbohidratos: Math.round(carbohidratos)
    });
  };

  return <div>Calculadora cargada correctamente</div>;
}
