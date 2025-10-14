export interface Database {
  public: {
    Tables: {
      manga: {
        Row: {
          id: string;
          title: string;
          image_url: string | null;
          rating: string | null;
          rank: string | null;
          alternative: string | null;
          author: string | null;
          artist: string | null;
          genres: string | null;
          type: string | null;
          release_year: string | null;
          status: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['manga']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['manga']['Insert']>;
      };
      chapters: {
        Row: {
          id: string;
          manga_id: string;
          title: string;
          url: string | null;
          chapter_number: number;
          published_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chapters']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chapters']['Insert']>;
      };
      chapter_images: {
        Row: {
          id: string;
          chapter_id: string;
          image_url: string;
          page_number: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chapter_images']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chapter_images']['Insert']>;
      };
    };
  };
}

export type Manga = Database['public']['Tables']['manga']['Row'];
export type Chapter = Database['public']['Tables']['chapters']['Row'];
export type ChapterImage = Database['public']['Tables']['chapter_images']['Row'];

export interface MangaWithChapters extends Manga {
  chapters: Chapter[];
}

export interface ChapterWithImages extends Chapter {
  images: ChapterImage[];
}
