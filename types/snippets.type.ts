type Snippet = {
  id: number;
  title: string;
  language: string;
  code: string;
  tags?: string[];
  description?: string;
  isFavorite?: boolean;
};

export type { Snippet };
