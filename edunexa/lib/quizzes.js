export function validateQuizPayload(body) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const courseId = typeof body?.courseId === "string" ? body.courseId : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const questions = body?.questions;

  if (!title || title.length > 160) return { error: "Enter a quiz title under 160 characters." };
  if (!courseId) return { error: "Choose a course for this quiz." };
  if (description.length > 2000) return { error: "Keep the quiz instructions under 2,000 characters." };
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 30) {
    return { error: "A quiz must contain between 1 and 30 questions." };
  }

  const normalizedQuestions = [];
  for (const [index, question] of questions.entries()) {
    const prompt = typeof question?.prompt === "string" ? question.prompt.trim() : "";
    const options = Array.isArray(question?.options)
      ? question.options.map((option) => typeof option === "string" ? option.trim() : "")
      : [];
    const explanation = typeof question?.explanation === "string" ? question.explanation.trim() : "";
    const topic = typeof question?.topic === "string" ? question.topic.trim() : "";
    const correctOptionIndex = question?.correctOptionIndex;

    if (!prompt || prompt.length > 1000) return { error: `Question ${index + 1} needs a prompt under 1,000 characters.` };
    if (options.length !== 4 || options.some((option) => !option || option.length > 300)) {
      return { error: `Question ${index + 1} needs four non-empty options, each under 300 characters.` };
    }
    if (new Set(options.map((option) => option.toLocaleLowerCase())).size !== 4) {
      return { error: `Question ${index + 1} has duplicate options.` };
    }
    if (!Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > 3) {
      return { error: `Choose the correct answer for question ${index + 1}.` };
    }
    if (explanation.length > 1200 || topic.length > 100) {
      return { error: `Question ${index + 1} has an explanation or topic that is too long.` };
    }

    normalizedQuestions.push({
      prompt,
      options,
      correctOptionIndex,
      explanation,
      topic,
      position: index,
    });
  }

  return { data: { title, courseId, description, questions: normalizedQuestions } };
}
