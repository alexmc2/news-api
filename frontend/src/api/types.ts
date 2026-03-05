export type HealthResponse = {
  ok: boolean;
};

export type SortField = 'published_at' | 'title';

export type SortOrder = 'asc' | 'desc';

export type Author = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  joined_at: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type Post = {
  id: number;
  title: string;
  summary: string | null;
  body: string;
  published_at: string;
};

export type PostsPagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type PostsResponse = {
  data: Post[];
  pagination: PostsPagination;
};

export type PostsQuery = {
  author_id?: number;
  from?: string;
  order?: SortOrder;
  page?: number;
  per_page?: number;
  q?: string;
  sort?: SortField;
  to?: string;
};

export type PostCreate = {
  title: string;
  summary?: string;
  body: string;
  author_ids: number[];
};

export type PostUpdate = {
  title?: string;
  summary?: string;
  body?: string;
};
