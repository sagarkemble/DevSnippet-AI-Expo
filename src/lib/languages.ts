export type LanguageDef = {
  label: string;
  value: string;
  ext: string;
};

export const LANGUAGES: LanguageDef[] = [
  { label: "JavaScript", value: "javascript", ext: "js" },
  { label: "TypeScript", value: "typescript", ext: "ts" },
  { label: "JSX", value: "jsx", ext: "jsx" },
  { label: "TSX", value: "tsx", ext: "tsx" },
  { label: "Python", value: "python", ext: "py" },
  { label: "C", value: "c", ext: "c" },
  { label: "C++", value: "cpp", ext: "cpp" },
  { label: "Java", value: "java", ext: "java" },
  { label: "Kotlin", value: "kotlin", ext: "kt" },
  { label: "Swift", value: "swift", ext: "swift" },
  { label: "Go", value: "go", ext: "go" },
  { label: "Rust", value: "rust", ext: "rs" },
  { label: "PHP", value: "php", ext: "php" },
  { label: "Ruby", value: "ruby", ext: "rb" },
  { label: "SQL", value: "sql", ext: "sql" },
  { label: "Bash", value: "bash", ext: "sh" },
  { label: "Shell", value: "shell", ext: "sh" },
  { label: "HTML", value: "html", ext: "html" },
  { label: "CSS", value: "css", ext: "css" },
  { label: "JSON", value: "json", ext: "json" },
  { label: "YAML", value: "yaml", ext: "yml" },
  { label: "Markdown", value: "markdown", ext: "md" },
  { label: "Dart", value: "dart", ext: "dart" },
  { label: "Scala", value: "scala", ext: "scala" },
  { label: "R", value: "r", ext: "r" },
  { label: "Perl", value: "perl", ext: "pl" },
];

export const findLanguage = (value: string): LanguageDef | undefined =>
  LANGUAGES.find((l) => l.value === value);

export const extensionFor = (value: string): string =>
  findLanguage(value)?.ext ?? value;

export const labelFor = (value: string): string =>
  findLanguage(value)?.label ?? value;
