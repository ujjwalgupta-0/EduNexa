import { auth } from "@/lib/auth";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseJsonText(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function validateQuiz(data, count) {
  if (!data || typeof data.title !== "string" || !Array.isArray(data.questions)) return false;
  if (data.questions.length !== count || data.questions.some((q) =>
    !q || typeof q.prompt !== "string" || !q.prompt.trim() ||
    !Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => typeof o !== "string" || !o.trim()) ||
    !Number.isInteger(q.correctOptionIndex) || q.correctOptionIndex < 0 || q.correctOptionIndex > 3
  )) return false;
  return true;
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Sign in to use the AI generator." }, { status: 401 });
  if (session.user.role !== "TEACHER") return Response.json({ error: "Teacher access is required." }, { status: 403 });
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: "AI generation is not configured. Ask your administrator to add a Gemini API key." }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Send a valid generation request." }, { status: 400 }); }

  const kind = body?.kind;
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  const requestDetails = typeof body?.request === "string" ? body.request.trim() : "";
  const difficulty = ["beginner", "intermediate", "advanced"].includes(body?.difficulty) ? body.difficulty : "intermediate";
  const count = Number(body?.count);
  const image = body?.image;
  if (!["quiz", "assignment"].includes(kind)) return Response.json({ error: "Choose quiz or assignment generation." }, { status: 400 });
  if (topic.length > 300 || requestDetails.length > 1000) return Response.json({ error: "Keep the topic under 300 characters and extra instructions under 1,000." }, { status: 400 });
  if (!topic && !image) return Response.json({ error: "Enter a topic or upload a photo of the learning material." }, { status: 400 });
  if (kind === "quiz" && (!Number.isInteger(count) || count < 3 || count > 15)) return Response.json({ error: "Choose between 3 and 15 quiz questions." }, { status: 400 });

  let imagePart;
  if (image !== undefined && image !== null) {
    if (!IMAGE_MIME_TYPES.has(image?.mimeType) || typeof image?.data !== "string" || image.data.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 8 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)) {
      return Response.json({ error: "Upload a JPEG, PNG, or WebP image up to 4 MB." }, { status: 400 });
    }
    const imageBytes = Buffer.from(image.data, "base64");
    if (!imageBytes.length || imageBytes.length > MAX_IMAGE_BYTES) return Response.json({ error: "Upload an image up to 4 MB." }, { status: 400 });
    imagePart = { inline_data: { mime_type: image.mimeType, data: image.data } };
  }

  const format = kind === "quiz"
    ? `Return only a JSON object with this shape: {"title":"...","description":"...","questions":[{"prompt":"...","options":["...","...","...","..."],"correctOptionIndex":0,"explanation":"...","topic":"..."}]}. Generate exactly ${count} clear, age-appropriate multiple-choice questions. There must be exactly four distinct options and one unambiguous correct answer per question. Make explanations accurate and concise.`
    : `Return only a JSON object with this shape: {"title":"...","instructions":"..."}. Create one classroom assignment based on the material. Instructions must clearly describe the task, expected student work, and simple success criteria. Do not include answer keys or solve the task for students.`;
  const prompt = `You are an experienced teacher creating classroom materials. Use the supplied lesson material${topic ? `, especially this topic: ${topic}` : ""}. Target difficulty: ${difficulty}. ${requestDetails ? `Teacher's extra guidance: ${requestDetails}.` : ""} If a photo is included, read only content that is legible and build the material from it. Do not invent facts that are not supported by the topic or image. ${format}`;

  try {
    let upstream;
    for (const model of ["gemini-3.8-flash", "gemini-3.6-flash"]) {
      upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [...(imagePart ? [imagePart] : []), { text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.35, maxOutputTokens: kind === "quiz" ? 5000 : 1800 },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(45000),
      });
      if (upstream.ok || ![404, 429, 500, 502, 503, 504].includes(upstream.status)) break;
    }

    if (!upstream.ok) {
      const details = await upstream.json().catch(() => null);
      console.error("Gemini teacher generation failed", upstream.status, details?.error?.status || "unknown");
      if (upstream.status === 401 || upstream.status === 403) return Response.json({ error: "Google rejected the Gemini key. Check the server's GEMINI_API_KEY configuration." }, { status: 502 });
      if (upstream.status === 429) return Response.json({ error: "The AI service reached its request limit. Wait a moment and try again." }, { status: 503 });
      return Response.json({ error: "The AI service could not generate this material. Please try again." }, { status: 502 });
    }

    const result = await upstream.json();
    const text = result.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
    if (!text) return Response.json({ error: "The AI returned an empty result. Try a clearer topic or photo." }, { status: 502 });
    const generated = parseJsonText(text);
    if (kind === "quiz") {
      if (!validateQuiz(generated, count)) return Response.json({ error: "The AI result was incomplete. Generate again or edit the quiz manually." }, { status: 502 });
      return Response.json({ result: {
        title: generated.title.trim().slice(0, 160), description: typeof generated.description === "string" ? generated.description.trim().slice(0, 2000) : "",
        questions: generated.questions.map((q) => ({ prompt: q.prompt.trim().slice(0, 1000), options: q.options.map((o) => o.trim().slice(0, 300)), correctOptionIndex: q.correctOptionIndex, explanation: typeof q.explanation === "string" ? q.explanation.trim().slice(0, 1200) : "", topic: typeof q.topic === "string" ? q.topic.trim().slice(0, 100) : topic.slice(0, 100) })),
      } });
    }
    if (typeof generated.title !== "string" || typeof generated.instructions !== "string" || !generated.title.trim() || generated.instructions.trim().length < 10) return Response.json({ error: "The AI result was incomplete. Try again or write the assignment yourself." }, { status: 502 });
    return Response.json({ result: { title: generated.title.trim().slice(0, 160), instructions: generated.instructions.trim().slice(0, 10000) } });
  } catch (error) {
    if (error?.name === "TimeoutError") return Response.json({ error: "Generation took too long. Try a smaller photo or a shorter request." }, { status: 504 });
    console.error("Teacher AI generation could not be parsed or completed.");
    return Response.json({ error: "The AI returned a result we could not read. Try again or edit your material manually." }, { status: 502 });
  }
}
