export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          confirmed_at: string | null
          hire_confirmed: boolean
          id: string
          opportunity_id: string | null
          seeker_id: string | null
          status: string
        }
        Insert: {
          applied_at?: string
          confirmed_at?: string | null
          hire_confirmed?: boolean
          id?: string
          opportunity_id?: string | null
          seeker_id?: string | null
          status?: string
        }
        Update: {
          applied_at?: string
          confirmed_at?: string | null
          hire_confirmed?: boolean
          id?: string
          opportunity_id?: string | null
          seeker_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hire_events: {
        Row: {
          application_id: string | null
          claimed_at: string | null
          confirmed_at: string | null
          id: string
          stipend_paid: boolean
        }
        Insert: {
          application_id?: string | null
          claimed_at?: string | null
          confirmed_at?: string | null
          id?: string
          stipend_paid?: boolean
        }
        Update: {
          application_id?: string | null
          claimed_at?: string | null
          confirmed_at?: string | null
          id?: string
          stipend_paid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hire_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string
          embedding: string | null
          founder_id: string | null
          id: string
          idea_pulse: number
          model: string | null
          problem: string | null
          status: string
          target_users: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          founder_id?: string | null
          id?: string
          idea_pulse?: number
          model?: string | null
          problem?: string | null
          status?: string
          target_users?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          embedding?: string | null
          founder_id?: string | null
          id?: string
          idea_pulse?: number
          model?: string | null
          problem?: string | null
          status?: string
          target_users?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          company: string | null
          created_at: string
          deadline: string | null
          description: string | null
          embedding: string | null
          id: string
          recruiter_id: string | null
          required_skills: string[] | null
          seats: number | null
          status: string
          stipend_text: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          recruiter_id?: string | null
          required_skills?: string[] | null
          seats?: number | null
          status?: string
          stipend_text?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          embedding?: string | null
          id?: string
          recruiter_id?: string | null
          required_skills?: string[] | null
          seats?: number | null
          status?: string
          stipend_text?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string | null
          vote: boolean | null
          voter_id: string | null
        }
        Insert: {
          id?: string
          poll_id?: string | null
          vote?: boolean | null
          voter_id?: string | null
        }
        Update: {
          id?: string
          poll_id?: string | null
          vote?: boolean | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          id: string
          idea_id: string | null
          no_count: number
          question: string | null
          yes_count: number
        }
        Insert: {
          id?: string
          idea_id?: string | null
          no_count?: number
          question?: string | null
          yes_count?: number
        }
        Update: {
          id?: string
          idea_id?: string | null
          no_count?: number
          question?: string | null
          yes_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "polls_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          caption: string | null
          created_at: string
          id: string
          kind: string
          media_path: string | null
          media_type: string | null
          media_url: string | null
        }
        Insert: {
          author_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind: string
          media_path?: string | null
          media_type?: string | null
          media_url?: string | null
        }
        Update: {
          author_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind?: string
          media_path?: string | null
          media_type?: string | null
          media_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          college: string | null
          course: string | null
          created_at: string
          dpdp_consent: boolean
          email_verified: boolean
          gender: string | null
          goal: string | null
          hire_proof_score: number
          id: string
          name: string | null
          role: string | null
          skills: string[] | null
          university: string | null
          verified_domain: string | null
          year: number | null
        }
        Insert: {
          age?: number | null
          college?: string | null
          course?: string | null
          created_at?: string
          dpdp_consent?: boolean
          email_verified?: boolean
          gender?: string | null
          goal?: string | null
          hire_proof_score?: number
          id: string
          name?: string | null
          role?: string | null
          skills?: string[] | null
          university?: string | null
          verified_domain?: string | null
          year?: number | null
        }
        Update: {
          age?: number | null
          college?: string | null
          course?: string | null
          created_at?: string
          dpdp_consent?: boolean
          email_verified?: boolean
          gender?: string | null
          goal?: string | null
          hire_proof_score?: number
          id?: string
          name?: string | null
          role?: string | null
          skills?: string[] | null
          university?: string | null
          verified_domain?: string | null
          year?: number | null
        }
        Relationships: []
      }
      qa_posts: {
        Row: {
          author_id: string | null
          body: string | null
          created_at: string
          id: string
          idea_id: string | null
          opportunity_id: string | null
          upvotes: number
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          idea_id?: string | null
          opportunity_id?: string | null
          upvotes?: number
        }
        Update: {
          author_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          idea_id?: string | null
          opportunity_id?: string | null
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "qa_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_upvotes: {
        Row: {
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_upvotes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "qa_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          rating: number | null
          reviewer_id: string | null
          target_id: string | null
          target_type: string | null
          verified: boolean
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          reviewer_id?: string | null
          target_id?: string | null
          target_type?: string | null
          verified?: boolean
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          reviewer_id?: string | null
          target_id?: string | null
          target_type?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_opportunities: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          company: string
          created_at: string
          deadline: string
          description: string
          hire_proof_score: number
          id: string
          match_score: number
          recruiter_id: string
          required_skills: string[]
          seats: number
          similarity: number
          status: string
          stipend_text: string
          title: string
          type: string
        }[]
      }
      cast_poll_vote: {
        Args: { p_poll_id: string; p_vote: boolean }
        Returns: {
          id: string
          idea_id: string | null
          no_count: number
          question: string | null
          yes_count: number
        }
      }
      add_qa_upvote: {
        Args: { p_post_id: string }
        Returns: {
          author_id: string | null
          body: string | null
          created_at: string
          id: string
          idea_id: string | null
          opportunity_id: string | null
          upvotes: number
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
