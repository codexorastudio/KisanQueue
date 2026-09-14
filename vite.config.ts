import { defineConfig, loadEnv, Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

function ttsDevPlugin(): Plugin {
  return {
    name: "tts-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api/tts")) {
          try {
            const parsedUrl = new URL(req.url, "http://localhost");
            const tl = parsedUrl.searchParams.get("tl") || "ml";
            const text = parsedUrl.searchParams.get("text") || "";
            if (!text) {
              res.statusCode = 400;
              res.end("Missing text");
              return;
            }
            const cleanText = text.slice(0, 180);
            const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
              tl
            )}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
            const upstream = await fetch(googleTtsUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
            });
            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end("TTS Error");
              return;
            }
            const arrayBuf = await upstream.arrayBuffer();
            const buf = Buffer.from(arrayBuf);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(buf);
            return;
          } catch (err) {
            console.error("TTS Dev Error:", err);
            res.statusCode = 500;
            res.end("Internal Server Error");
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env["GEMINI_API_KEY"] || env["VITE_GEMINI_API_KEY"] || ""),
      "process.env.SARVAM_API_KEY": JSON.stringify(env["SARVAM_API_KEY"] || env["VITE_SARVAM_API_KEY"] || ""),
    },
    plugins: [
      ttsDevPlugin(),
      tsconfigPaths(),
      tanstackStart({
        server: { entry: "src/server.ts" },
      }),
      nitro({
        preset: "vercel",
      }),
      viteReact(),
      tailwindcss(),
    ],
  };
});
