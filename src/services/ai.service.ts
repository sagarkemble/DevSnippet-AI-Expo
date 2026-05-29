const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

class AIService {
  async explainSnippet(snippet: {
    title: string;
    language: string;
    tags?: string[];
    description?: string;
    code: string;
  }) {
    try {
      if (!OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key is not configured");
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `
You are a senior software engineer.

Explain code in:
- beginner friendly language
- simple words
- step by step

Also explain:
- what the code does
- important concepts
- possible improvements
- bugs if present
`,
              },
              {
                role: "user",
                content: `Title: ${snippet.title}
Language: ${snippet.language}
${snippet.description ? `Description: ${snippet.description}` : ""}
${snippet.tags?.length ? `Tags: ${snippet.tags.join(", ")}` : ""}

Code:
\`\`\`${snippet.language}
${snippet.code}
\`\`\``,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API error:", errorData);
        throw new Error(
          errorData.error?.message ||
            `API request failed with status ${response.status}`,
        );
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        console.error("Invalid API response:", data);
        throw new Error("Invalid response from AI service");
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error("AI Service Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to generate explanation");
    }
  }
}

export default new AIService();
