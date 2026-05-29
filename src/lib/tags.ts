export const SNIPPET_TAGS = [
  // Language ecosystems
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Kotlin",
  "Swift",
  "C++",
  "PHP",
  "Ruby",

  // Frameworks / libraries
  "React",
  "React Native",
  "Next.js",
  "Vue",
  "Svelte",
  "Node.js",
  "Express",
  "Django",
  "FastAPI",
  "Tailwind",

  // Concept / domain
  "API",
  "Database",
  "Auth",
  "UI",
  "Animation",
  "Testing",
  "DevOps",
  "Docker",
  "CI/CD",
  "Performance",
  "Security",
  "Networking",
  "State",
  "Cache",
  "Queue",

  // Pattern / shape
  "Algorithm",
  "Data Structure",
  "Hook",
  "Component",
  "Utility",
  "Helper",
  "Snippet",
  "Boilerplate",
  "Config",
  "Migration",
  "Regex",

  // Lifecycle
  "Bug Fix",
  "Optimization",
  "Refactor",
  "Workaround",
  "Experiment",
  "Reference",
] as const;

export type SnippetTag = (typeof SNIPPET_TAGS)[number];
