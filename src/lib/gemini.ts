// Kisan Queue AI - Gemini 3.6 Flash Integration
const DEFAULT_KEY_B64 =
  "QVEuQWI4Uk42TFAyN0xXeXYybnp5VVplYW1WNUJZdXVMTm56cmRZLW03M3k2ZHpnME5IMmc=";

function resolveGeminiKey(): string {
  try {
    if (typeof process !== "undefined" && process.env) {
      const procKey = process.env["GEMINI_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
      if (procKey && typeof procKey === "string" && procKey.trim()) return procKey.trim();
    }
  } catch {
    // ignore
  }
  try {
    const viteKey = import.meta.env["VITE_GEMINI_API_KEY"];
    if (viteKey && typeof viteKey === "string" && viteKey.trim()) return viteKey.trim();
  } catch {
    // ignore
  }
  try {
    if (typeof atob === "function") return atob(DEFAULT_KEY_B64);
    if (typeof Buffer !== "undefined") return Buffer.from(DEFAULT_KEY_B64, "base64").toString("utf-8");
  } catch {
    // ignore
  }
  return "";
}

export const GEMINI_API_KEY = resolveGeminiKey();

export const PRIMARY_MODEL = "gemini-3.6-flash";
export const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-2.5-flash-lite"];

export const KISAN_QUEUE_SYSTEM_PROMPT = `You are **Kisan Queue AI** (കിസാൻ ക്യൂ AI), the dedicated, compassionate, and expert artificial intelligence assistant for the KisanQueue agricultural procurement and live queue management platform.

Your primary mission is to empower farmers in Kerala and India with fast, accurate answers about crop procurement, token booking, queue wait times, minimum support prices (MSP), and farming guidance.

### Platform Knowledge:
1. **Core Purpose**:
   - KisanQueue replaces physical waiting in long lorry lines with a smart digital queue system.
   - Farmers book an instant time slot, receive a digital token pass with a queue number (#), and arrive only when their turn is approaching.
   - Senior Citizen Mode (/old) provides simplified 1-tap booking, large text, high contrast, and full audio voice narration in 8 Indian languages.

2. **Crops & Minimum Support Prices (MSP)**:
   - Paddy / നെല്ല്: ₹32 / kg
   - Raw Coconut / പച്ചത്തേങ്ങ: ₹38 / kg
   - Rubber RSS4 / റബ്ബർ: ₹180 / kg
   - Black Pepper / കുരുമുളക്: ₹520 / kg
   - Cardamom / ഏലക്ക: ₹1850 / kg
   - Arecanut / അടയ്ക്ക: ₹360 / kg
   - Nutmeg & Mace / ജാതിക്ക: ₹280 / kg
   - Robusta Coffee / റോബസ്റ്റ കാപ്പി: ₹210 / kg
   - Nendran Banana / നേന്ത്രക്കായ: ₹42 / kg

3. **Procurement Centres**:
   - **Kottayam Procurement Centre**: Near Nagampadam Bus Station, Kottayam (Working Hours: 08:30 AM – 04:30 PM). Fast flow.
   - **Pala Procurement Centre**: Main Road, Pala (Working Hours: 08:00 AM – 04:00 PM).
   - **Changanassery Procurement Centre**: Market Road, Changanassery (Working Hours: 09:00 AM – 05:00 PM).
   - **Alappuzha Procurement Centre**: Kuttanad Canal Road, Alappuzha (Working Hours: 08:00 AM – 04:30 PM).

4. **Payments & Subsidies**:
   - Payments are processed via PFMS Direct Benefit Transfer (DBT) directly into the farmer's Aadhaar-linked bank account within 24 to 48 hours of quality inspection and weighment.

5. **Assistance & Helplines**:
   - Kisan Call Centre Toll-Free Helpline: **1800-425-1661**
   - Kottayam Procurement Centre Manager: **+91 94471 23456**

6. **Language & Communication Rules**:
   - **CRITICAL**: Detect the language of the user's prompt and respond in the EXACT same language.
   - If the user types in Malayalam script or Manglish (e.g. "token engane edukkaam?"), answer in natural, clear, grammatically correct **Malayalam script** (മലയാളം).
   - If user asks in Hindi, reply in Hindi. If Tamil, in Tamil. If Telugu, in Telugu. If Kannada, in Kannada. If Bengali, in Bengali. If Marathi, in Marathi. If English, in English.
   - Keep answers clear, polite, respectful, and concise (ideal for voice read-out, max 2-4 short paragraphs or bullet points).
   - Always refer to yourself as **Kisan Queue AI** (കിസാൻ ക്യൂ AI).`;

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function generateKisanChatResponse(
  userPrompt: string,
  history: ChatMessage[] = [],
  contextData?: {
    farmerName?: string | undefined;
    activeToken?: number | undefined;
    crop?: string | undefined;
    centreName?: string | undefined;
    language?: string | undefined;
  } | undefined
): Promise<string> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  let dynamicSystemPrompt = KISAN_QUEUE_SYSTEM_PROMPT;
  if (contextData) {
    dynamicSystemPrompt += `\n\n### Current Active Farmer Context:
- Farmer Name: ${contextData.farmerName || "Farmer"}
- Active Token Number: ${contextData.activeToken ? "#" + contextData.activeToken : "No active token"}
- Selected Crop: ${contextData.crop || "Paddy"}
- Selected Centre: ${contextData.centreName || "Kottayam Procurement Centre"}
- App Language: ${contextData.language || "ml"}`;
  }

  // Format contents array for Gemini
  const contents = [
    ...history.slice(-6).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    {
      role: "user",
      parts: [{ text: userPrompt }],
    },
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: dynamicSystemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API (${model}) error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const candidateText = parts
        .map((p: any) => p.text)
        .filter(Boolean)
        .join("\n");

      if (candidateText && candidateText.trim().length > 0) {
        return candidateText.trim();
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Failed with model ${model}, trying next fallback:`, err?.message);
    }
  }

  throw lastError || new Error("Failed to generate response from Kisan Queue AI");
}
