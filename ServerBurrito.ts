import express from "express";
import cors from "cors";
import { createVertex } from "@ai-sdk/google-vertex";
import { generateText, experimental_generateImage as generateImage } from "ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Instancia del proveedor de Vertex AI
const vertex = createVertex({
  // project: process.env.GOOGLE_CLOUD_PROJECT || "my-project",
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
  apiKey: process.env.GOOGLE_BURRITO_AI_API_KEY || process.env.GOOGLE_BURRITO_AI_API_KEY2,
  project: process.env.GOOGLR_BURRITO_CHATS_AI_API_KEY,
});

// ─── Endpoint 1: Generación de Texto / Chat ──────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Se requiere un prompt válido." });
      return;
    }

    const { text } = await generateText({
      model: vertex("gemini-2.0-flash-001"), // Se usa la constante 'vertex' instanciada arriba
      prompt,
    });

    res.json({ text });
  } catch (error) {
    console.error("Error en chat Vertex AI:", error);
    res.status(500).json({
      error: "Error generando respuesta con Gemini",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
// ─── Endpoint 2: Generación de Imágenes + Explicación ───────────────────────
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Se requiere un prompt válido." });
      return;
    }

    // 1. Generar la imagen con Imagen 3
    const { image } = await generateImage({
      model: vertex.image("imagen-3.0-generate-001"),
      prompt: prompt.trim(),
      aspectRatio: "1:1",
    });

    // 2. Describir la imagen con Gemini Pro/Flash
    const { text: imageExplanation } = await generateText({
      model: vertex("gemini-2.0-flash-001"),
      prompt: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Explica y describe en detalle el contenido de esta imagen en español.",
            },
            {
              type: "image",
              image: image.uint8Array, // Solo pasas los datos binarios directamente
            },
          ],
        },
      ],
    });

    res.json({
      image: image.base64,
      mimeType: "image/jpeg",
      explanation: imageExplanation,
    });
  } catch (error) {
    console.error("Error generando imagen o descripción con Vertex AI:", error);
    res.status(500).json({
      error: "Error en el procesamiento con Vertex AI",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
app.listen(3002, () => {
  console.log(" Servidor Vertex AI listo en http://localhost:3002");
  console.log("   POST /chat           → Generación de texto");
  console.log("   POST /generate-image → Generación de imagen + explicación");
});