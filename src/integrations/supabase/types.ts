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
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      course_instructors: {
        Row: {
          course_date_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_date_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_date_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_instructors_course_date_id_fkey"
            columns: ["course_date_id"]
            isOneToOne: false
            referencedRelation: "course_dates"
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
      invoice_history: {
        Row: {
          action: string
          change_reason: string | null
          id: string
          invoice_id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          performed_at: string
          performed_by: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          change_reason?: string | null
          id?: string
          invoice_id: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          change_reason?: string | null
          id?: string
          invoice_id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "active_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          course_date_id: string | null
          course_id: string | null
          created_at: string
          description: string
          gross_amount: number
          id: string
          invoice_id: string
          net_amount: number
          position: number
          quantity: number
          unit: string | null
          unit_price: number
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          course_date_id?: string | null
          course_id?: string | null
          created_at?: string
          description: string
          gross_amount: number
          id?: string
          invoice_id: string
          net_amount: number
          position: number
          quantity?: number
          unit?: string | null
          unit_price: number
          vat_amount: number
          vat_rate?: number
        }
        Update: {
          course_date_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string
          gross_amount?: number
          id?: string
          invoice_id?: string
          net_amount?: number
          position?: number
          quantity?: number
          unit?: string | null
          unit_price?: number
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_course_date_id_fkey"
            columns: ["course_date_id"]
            isOneToOne: false
            referencedRelation: "course_dates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "active_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          archived_until: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_invoice_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          due_date: string | null
          gross_amount: number
          id: string
          internal_notes: string | null
          invoice_date: string
          invoice_number: string
          is_deleted: boolean
          is_locked: boolean
          locked_at: string | null
          locked_by: string | null
          net_amount: number
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          participant_id: string | null
          payment_method: string | null
          payment_reference: string | null
          pdf_generated_at: string | null
          pdf_url: string | null
          recipient_address: string | null
          recipient_email: string | null
          recipient_name: string
          recipient_zip_city: string | null
          registration_id: string | null
          service_date: string | null
          service_period_end: string | null
          service_period_start: string | null
          status: string
          updated_at: string
          vat_amount: number
          vat_rate: number
          version: number
        }
        Insert: {
          archived_until?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_invoice_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          gross_amount?: number
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number: string
          is_deleted?: boolean
          is_locked?: boolean
          locked_at?: string | null
          locked_by?: string | null
          net_amount?: number
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          participant_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name: string
          recipient_zip_city?: string | null
          registration_id?: string | null
          service_date?: string | null
          service_period_end?: string | null
          service_period_start?: string | null
          status?: string
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
          version?: number
        }
        Update: {
          archived_until?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_invoice_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          gross_amount?: number
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string
          is_deleted?: boolean
          is_locked?: boolean
          locked_at?: string | null
          locked_by?: string | null
          net_amount?: number
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          participant_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string
          recipient_zip_city?: string | null
          registration_id?: string | null
          service_date?: string | null
          service_period_end?: string | null
          service_period_start?: string | null
          status?: string
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_cancelled_invoice_id_fkey"
            columns: ["cancelled_invoice_id"]
            isOneToOne: false
            referencedRelation: "active_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_cancelled_invoice_id_fkey"
            columns: ["cancelled_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
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
      login_history: {
        Row: {
          id: string
          ip_address: string | null
          login_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          login_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          login_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      participant_documents: {
        Row: {
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          participant_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          participant_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          participant_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_documents_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_history: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          participant_id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          participant_id: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          participant_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_history_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          first_name: string
          id: string
          internal_notes: string | null
          is_deleted: boolean
          last_name: string
          phone: string | null
          status: string
          tags: string[] | null
          updated_at: string
          zip_city: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          first_name: string
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean
          last_name: string
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          zip_city?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          first_name?: string
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean
          last_name?: string
          phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          zip_city?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          invoice_url: string | null
          is_deleted: boolean
          notes: string | null
          paid_at: string | null
          participant_id: string | null
          payment_method: string | null
          registration_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          is_deleted?: boolean
          notes?: string | null
          paid_at?: string | null
          participant_id?: string | null
          payment_method?: string | null
          registration_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_url?: string | null
          is_deleted?: boolean
          notes?: string | null
          paid_at?: string | null
          participant_id?: string | null
          payment_method?: string | null
          registration_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
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
          deleted_at: string | null
          deleted_by: string | null
          email: string
          first_name: string
          id: string
          is_deleted: boolean
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
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          first_name: string
          id?: string
          is_deleted?: boolean
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
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          first_name?: string
          id?: string
          is_deleted?: boolean
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
      staff_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
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
      active_invoices: {
        Row: {
          archived_until: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_invoice_id: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          due_date: string | null
          gross_amount: number | null
          id: string | null
          internal_notes: string | null
          invoice_date: string | null
          invoice_number: string | null
          is_deleted: boolean | null
          is_locked: boolean | null
          locked_at: string | null
          locked_by: string | null
          net_amount: number | null
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          participant_id: string | null
          payment_method: string | null
          payment_reference: string | null
          pdf_generated_at: string | null
          pdf_url: string | null
          recipient_address: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_zip_city: string | null
          registration_id: string | null
          service_date: string | null
          service_period_end: string | null
          service_period_start: string | null
          status: string | null
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
          version: number | null
        }
        Insert: {
          archived_until?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          gross_amount?: number | null
          id?: string | null
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          is_deleted?: boolean | null
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          net_amount?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          participant_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_zip_city?: string | null
          registration_id?: string | null
          service_date?: string | null
          service_period_end?: string | null
          service_period_start?: string | null
          status?: string | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          version?: number | null
        }
        Update: {
          archived_until?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          gross_amount?: number | null
          id?: string | null
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_number?: string | null
          is_deleted?: boolean | null
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          net_amount?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          participant_id?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_zip_city?: string | null
          registration_id?: string | null
          service_date?: string | null
          service_period_end?: string | null
          service_period_start?: string | null
          status?: string | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_cancelled_invoice_id_fkey"
            columns: ["cancelled_invoice_id"]
            isOneToOne: false
            referencedRelation: "active_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_cancelled_invoice_id_fkey"
            columns: ["cancelled_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      datev_export: {
        Row: {
          Belegdatum: string | null
          Belegnummer: string | null
          Buchungstext: string | null
          Erlöskonto: string | null
          Gegenkonto: string | null
          Status: string | null
          "Umsatz (brutto)": number | null
          "Umsatz (netto)": number | null
          "USt-Betrag": number | null
          "USt-Satz": number | null
          Zahldatum: string | null
        }
        Insert: {
          Belegdatum?: string | null
          Belegnummer?: string | null
          Buchungstext?: string | null
          Erlöskonto?: never
          Gegenkonto?: never
          Status?: never
          "Umsatz (brutto)"?: number | null
          "Umsatz (netto)"?: number | null
          "USt-Betrag"?: number | null
          "USt-Satz"?: number | null
          Zahldatum?: string | null
        }
        Update: {
          Belegdatum?: string | null
          Belegnummer?: string | null
          Buchungstext?: string | null
          Erlöskonto?: never
          Gegenkonto?: never
          Status?: never
          "Umsatz (brutto)"?: number | null
          "Umsatz (netto)"?: number | null
          "USt-Betrag"?: number | null
          "USt-Satz"?: number | null
          Zahldatum?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_course_instructor: {
        Args: { _course_date_id: string; _user_id: string }
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
