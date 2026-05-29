import { CodeBlock } from "@/components/ui/code-block";
import { Text } from "@/components/ui/text";
import { Heart } from "lucide-react-native";
import { Pressable, View } from "react-native";

type SnippetRowProps = {
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  onPress?: () => void;
};

export const SnippetRow = ({
  title,
  language,
  code,
  description,
  tags,
  isFavorite,
  onPress,
}: SnippetRowProps) => {
  return (
    <Pressable onPress={onPress} className="active:opacity-70 mb-2">
      <View className="border border-border rounded-xl bg-muted/30 p-4 gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-foreground">
              {title}
            </Text>
            <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {language}
            </Text>
          </View>
          {isFavorite ? (
            <Heart size={16} color="#ec4899" fill="#ec4899" strokeWidth={1.5} />
          ) : null}
        </View>

        {description ? (
          <Text
            className="text-sm text-muted-foreground leading-5"
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}

        <View className="mt-1">
          <CodeBlock
            code={code}
            language={language}
            numberOfLines={2}
            fontSize={12}
            wrap={false}
          />
        </View>

        {tags && tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5 mt-1">
            {tags.slice(0, 4).map((tag) => (
              <Text
                key={tag}
                className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
              >
                #{tag.toLowerCase()}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};
