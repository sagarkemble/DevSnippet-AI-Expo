declare module "react-native-syntax-highlighter" {
  import { ComponentType } from "react";
  import { TextStyle, ViewStyle } from "react-native";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: Record<string, TextStyle | ViewStyle | { [key: string]: any }>;
    customStyle?: ViewStyle | TextStyle;
    fontFamily?: string;
    fontSize?: number;
    highlighter?: "prism" | "hljs";
    showLineNumbers?: boolean;
    lineNumberStyle?: TextStyle;
    lineProps?:
      | { style?: TextStyle | ViewStyle }
      | ((line: number) => { style?: TextStyle | ViewStyle });
    children?: string;
  }

  const SyntaxHighlighter: ComponentType<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}
