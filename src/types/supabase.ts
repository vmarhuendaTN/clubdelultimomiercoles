// Generado desde el proyecto de Supabase (generate_typescript_types). No editar a mano.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      valoraciones: {
        Row: {
          actualizado_en: string;
          autor_nombre: string;
          book_slug: string;
          creado_en: string;
          estrellas: number;
          id: string;
          opinion: string | null;
          user_id: string;
        };
        Insert: {
          actualizado_en?: string;
          autor_nombre?: string;
          book_slug: string;
          creado_en?: string;
          estrellas: number;
          id?: string;
          opinion?: string | null;
          user_id?: string;
        };
        Update: {
          actualizado_en?: string;
          autor_nombre?: string;
          book_slug?: string;
          creado_en?: string;
          estrellas?: number;
          id?: string;
          opinion?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      valoraciones_resumen: {
        Row: {
          book_slug: string | null;
          media: number | null;
          total: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      nombre_publico: { Args: { uid: string }; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
