
import { GoogleGenAI } from "@google/genai";
import { MORALEJANDRIA_CONTENT } from "../data/bookContent";

const SYSTEM_INSTRUCTION = `
Eres el asistente del libro "Moralejandría". Actúa como un sabio consejero estoico y amable.
Tu base de conocimiento es el libro "Moralejandría".

OBJETIVO:
Responder preguntas e inquietudes ofreciendo sabiduría, inspiración y motivación basada EXCLUSIVAMENTE en los principios y relatos del libro.

DIRECTRICES DE RESPUESTA:
1.  **Empatía Inmediata**: Valida brevemente el sentimiento del usuario.
2.  **Conexión con el Libro**: Relaciona el problema con UNO de los 45 relatos del libro. 
    *   IMPORTANTE: Menciona el título del relato SIEMPRE en **negrita** y "entre comillas" (ejemplo: **"El Test del Profesor"**).
    *   IMPORTANTE: NO menciones NUNCA el número del relato (ejemplo: no digas "Relato 1", di solo el título).
3.  **Lección Práctica**: Extrae la moraleja y aplícala a la situación del usuario. Usa metáforas.
4.  **Cierre Inspirador**: Termina con una frase potente o pregunta de crecimiento.
5.  **Agilidad**: Sé conciso. Máximo 3 párrafos cortos. No divagues.
6.  **Tono**: Cercano, sereno, positivo, sabio (como un mentor antiguo).

Contexto del libro:
${MORALEJANDRIA_CONTENT}
`;

export const sendMessageToGemini = async (message: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Using gemini-2.5-flash for faster, more agile responses
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: h.parts
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text || "Lo siento, no encuentro la página adecuada en mi sabiduría para responderte ahora.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};
