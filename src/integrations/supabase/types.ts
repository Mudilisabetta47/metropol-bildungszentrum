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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contact_requests: {
        Row: {
          course_interest: string | null
          created_at: string
          email: string
          id: string
          is_archived: boolean
          is_read: boolean
          location_preference: string | null
          message: string
          name: string
          phone: string | null
          source: string | null
          subject: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          course_interest?: string | null
          created_at?: string
          email: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          location_preference?: string | null
          message: string
          name: string
          phone?: string | null
          source?: string | null
          subject?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          course_interest?: string | null
          created_at?: string
          email?: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          location_preference?: string | null
          message?: string
          name?: string
          phone?: string | null
          source?: string | null
          subject?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      course_dates: {
        Row: {
          course_id: string
          created_at: string
          current_participants: number
          end_date: string | null
          end_time: string | null
          id: string
          is_active: boolean
          location_id: string
          max_participants: number
          notes: string | null
          start_date: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          current_participants?: number
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          location_id: string
          max_participants?: number
          notes?: string | null
          start_date: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          current_participants?: number
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          location_id?: string
          max_participants?: number
          notes?: string | null
          start_date?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_dates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_dates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          benefits: string[] | null
          category: Database["public"]["Enums"]["course_category"]
          created_at: string
          description: string | null
          duration_info: string | null
          id: string
          image_url: string | null
          is_active: boolean
          price: number | null
          price_info: string | null
          requirements: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          category: Database["public"]["Enums"]["course_category"]
          created_at?: string
          description?: string | null
          duration_info?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: number | null
          price_info?: string | null
          requirements?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          category?: Database["public"]["Enums"]["course_category"]
          created_at?: string
          description?: string | null
          duration_info?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price?: number | null
          price_info?: string | null
          requirements?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          landing_page: string | null
          referrer: string | null
          registration_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer?: string | null
          registration_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer?: string | null
          registration_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          map_url: string | null
          name: string
          opening_hours: string | null
          phone: string | null
          slug: string
          updated_at: string
          zip_city: string
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          map_url?: string | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          slug: string
          updated_at?: string
          zip_city: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          map_url?: string | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string
          zip_city?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          address: string | null
          confirmation_sent_at: string | null
          course_date_id: string
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          message: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          zip_city: string | null
        }
        Insert: {
          address?: string | null
          confirmation_sent_at?: string | null
          course_date_id: string
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          message?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zip_city?: string | null
        }
        Update: {
          address?: string | null
          confirmation_sent_at?: string | null
          course_date_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zip_city?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_course_date_id_fkey"
            columns: ["course_date_id"]
            isOneToOne: false
            referencedRelation: "course_dates"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
          updated_at: string
          value: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "employee"
        | "user"
        | "super_admin"
        | "instructor"
        | "support"
      course_category:
        | "lkw"
        | "bus"
        | "fahrlehrer"
        | "bkf"
        | "sprache"
        | "sonstige"
      registration_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "waitlist"
        | "completed"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "employee",
        "user",
        "super_admin",
        "instructor",
        "support",
      ],
      course_category: [
        "lkw",
        "bus",
        "fahrlehrer",
        "bkf",
        "sprache",
        "sonstige",
      ],
      registration_status: [
        "pending",
        "confirmed",
        "cancelled",
        "waitlist",
        "completed",
      ],
    },
  },
} as const
