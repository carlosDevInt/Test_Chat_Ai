import express from "express";
import cors from "cors";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateImage, generateText } from "ai";
import { createXai } from "@ai-sdk/xai";
import dotenv from "dotenv";

// import express from "express";
// import cors from "cors";
// import { createVertex } from "@ai-sdk/google-vertex";
// import { generateText, generateImage } from "ai";
// import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


//Google AI Studio
const google = createGoogleGenerativeAI({
  apiKey:process.env.GOOGLE_GENERATIVE_AI_API_KEY ||process.env.GOOGLE_BURRITO_AI_API_KEY || process.env.GOOGLE_BURRITO_AI_API_KEY2,
});

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || process.env.GROK_API_KEY,
});

// // Instancia del proveedor de Vertex AI
// const vertex = createVertex({
//   // project: process.env.GOOGLE_CLOUD_PROJECT || "my-project",
//   location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
//   apiKey: process.env.GOOGLE_BURRITO_AI_API_KEY || process.env.GOOGLE_BURRITO_AI_API_KEY2,
//   project: process.env.GOOGLE_CLOUD_PROJECT,
// });

// ─── Endpoint 1: Generación de Texto / Chat ──────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Se requiere un prompt válido." });
      return;
    }

    // const { text } = await generateText({
    //   model: vertex("gemini-2.0-flash-001"), // Se usa la constante 'vertex' instanciada arriba
    //   prompt,
    // });

    // En /chat:
    const { text } = await generateText({
      model: google("gemini-3.1-flash-lite"),
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

    // // 1. Generar la imagen con Imagen 3
    // const { image } = await generateImage({
    //   model: vertex.image("gemini-3-pro-image-preview"),
    //   prompt: prompt.trim(),
    //   aspectRatio: "1:1",
    // });

    const { images } = await generateImage({
      // model: xai.image("grok-imagine-image-quality"),
      model: xai.image("grok-imagine-image"),
      prompt: prompt.trim(),
      providerOptions: {
        xai: { quality: "high" },
      },
    });

    if (!images[0]) {
      throw new Error("xAI no devolvió una imagen.");
    }

    const image = images[0];
    const imageBytes = image.uint8Array;

    // 2. Describir la imagen con Gemini Pro/Flash
    const { text: imageExplanation } = await generateText({
      model: google("gemini-3.1-flash-lite"),
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
              image: imageBytes,
            },
          ],
        },
      ],
    });

    res.json({
      image: image.base64,
      mimeType: image.mediaType,
      explanation: imageExplanation,
    });
  } catch (error) {
    const apiError = error as { statusCode?: number; message?: string };
    const isXaiBillingError = apiError.statusCode === 403 &&
      apiError.message?.includes("credits or licenses");

    console.error("Error generando imagen o descripción con xAI/Gemini:", error);
    res.status(isXaiBillingError ? 402 : 500).json({
      error: isXaiBillingError
        ? "La cuenta de xAI no tiene créditos o licencia activa."
        : "Error en el procesamiento con xAI/Gemini",
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
