import { Text } from "@/components/ui/text";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-perl";
import "prismjs/components/prism-php";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-scala";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import { useColorScheme } from "nativewind";
import { ScrollView, View } from "react-native";

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  numberOfLines?: number;
  wrap?: boolean;
  variant?: "muted" | "transparent";
  fontSize?: number;
};

const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
  "c++": "cpp",
};

const resolveLanguage = (lang?: string) => {
  if (!lang) return null;
  const key = LANG_ALIASES[lang.toLowerCase()] ?? lang.toLowerCase();
  return Prism.languages[key] ? key : null;
};

type Token = { content: string; type: string };

const flatten = (
  input: string | Prism.Token | (string | Prism.Token)[],
  type: string = "plain",
): Token[] => {
  if (typeof input === "string") {
    return [{ content: input, type }];
  }
  if (Array.isArray(input)) {
    return input.flatMap((t) => flatten(t, type));
  }
  const nextType = input.type ? input.type : type;
  if (typeof input.content === "string") {
    return [{ content: input.content, type: nextType }];
  }
  return flatten(input.content as any, nextType);
};

const lightColors: Record<string, string> = {
  plain: "#1f2937",
  comment: "#9ca3af",
  prolog: "#9ca3af",
  doctype: "#9ca3af",
  cdata: "#9ca3af",
  punctuation: "#1f2937",
  property: "#0369a1",
  tag: "#1f2937",
  boolean: "#b45309",
  number: "#b45309",
  constant: "#b45309",
  symbol: "#0369a1",
  deleted: "#b45309",
  selector: "#7c3aed",
  "attr-name": "#0369a1",
  string: "#15803d",
  char: "#15803d",
  builtin: "#b45309",
  inserted: "#15803d",
  operator: "#1f2937",
  entity: "#1f2937",
  url: "#0369a1",
  variable: "#1f2937",
  atrule: "#7c3aed",
  "attr-value": "#15803d",
  function: "#0369a1",
  "class-name": "#0369a1",
  keyword: "#7c3aed",
  regex: "#b45309",
  important: "#7c3aed",
  bold: "#1f2937",
  italic: "#1f2937",
  parameter: "#1f2937",
  "template-string": "#15803d",
  "template-punctuation": "#15803d",
  "template-variable": "#1f2937",
};

const darkColors: Record<string, string> = {
  plain: "#e5e7eb",
  comment: "#6b7280",
  prolog: "#6b7280",
  doctype: "#6b7280",
  cdata: "#6b7280",
  punctuation: "#e5e7eb",
  property: "#7dd3fc",
  tag: "#e5e7eb",
  boolean: "#fcd34d",
  number: "#fcd34d",
  constant: "#fcd34d",
  symbol: "#7dd3fc",
  deleted: "#fcd34d",
  selector: "#c4b5fd",
  "attr-name": "#7dd3fc",
  string: "#86efac",
  char: "#86efac",
  builtin: "#fcd34d",
  inserted: "#86efac",
  operator: "#e5e7eb",
  entity: "#e5e7eb",
  url: "#7dd3fc",
  variable: "#e5e7eb",
  atrule: "#c4b5fd",
  "attr-value": "#86efac",
  function: "#7dd3fc",
  "class-name": "#7dd3fc",
  keyword: "#c4b5fd",
  regex: "#fcd34d",
  important: "#c4b5fd",
  bold: "#e5e7eb",
  italic: "#e5e7eb",
  parameter: "#e5e7eb",
  "template-string": "#86efac",
  "template-punctuation": "#86efac",
  "template-variable": "#e5e7eb",
};

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  numberOfLines,
  wrap = true,
  variant = "muted",
  fontSize = 13,
}: CodeBlockProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? darkColors : lightColors;

  const containerClass =
    variant === "muted"
      ? "rounded-xl bg-muted px-3 py-3"
      : "rounded-none bg-transparent px-0 py-0";

  const allLines = code.split("\n");
  const displayed =
    numberOfLines && numberOfLines > 0
      ? allLines.slice(0, numberOfLines)
      : allLines;

  const langKey = resolveLanguage(language);

  const lines = displayed.map((line) => {
    if (!langKey) {
      return [{ content: line, type: "plain" }] as Token[];
    }
    try {
      const grammar = Prism.languages[langKey];
      const tokens = Prism.tokenize(line, grammar) as (string | Prism.Token)[];
      return flatten(tokens);
    } catch {
      return [{ content: line, type: "plain" }] as Token[];
    }
  });

  const lineNumberColor = isDark ? "#52525b" : "#a1a1aa";

  const renderLine = (tokens: Token[], idx: number) => (
    <View key={idx} className="flex-row" style={{ flexWrap: wrap ? "wrap" : "nowrap" }}>
      {showLineNumbers ? (
        <Text
          style={{
            color: lineNumberColor,
            fontFamily: "monospace",
            fontSize,
            minWidth: 28,
            textAlign: "right",
            marginRight: 12,
          }}
        >
          {idx + 1}
        </Text>
      ) : null}
      <View
        className="flex-row"
        style={{
          flexWrap: wrap ? "wrap" : "nowrap",
          flex: wrap ? 1 : 0,
        }}
      >
        {tokens.length === 0 ? (
          <Text
            style={{
              color: colors.plain,
              fontFamily: "monospace",
              fontSize,
              lineHeight: fontSize * 1.5,
            }}
          >
            {" "}
          </Text>
        ) : (
          tokens.map((tok, i) => (
            <Text
              key={i}
              style={{
                color: colors[tok.type] ?? colors.plain,
                fontFamily: "monospace",
                fontSize,
                lineHeight: fontSize * 1.5,
              }}
            >
              {tok.content}
            </Text>
          ))
        )}
      </View>
    </View>
  );

  const body = <View>{lines.map(renderLine)}</View>;

  if (wrap) {
    return <View className={containerClass}>{body}</View>;
  }

  return (
    <View className={containerClass}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {body}
      </ScrollView>
    </View>
  );
};
