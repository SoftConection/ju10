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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_status: string | null
          created_at: string
          enrollment_id: string
          enrollment_type: string
          id: string
          paid_at: string | null
          referred_user_id: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number
          commission_status?: string | null
          created_at?: string
          enrollment_id: string
          enrollment_type: string
          id?: string
          paid_at?: string | null
          referred_user_id: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_status?: string | null
          created_at?: string
          enrollment_id?: string
          enrollment_type?: string
          id?: string
          paid_at?: string | null
          referred_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          commission_rate: number | null
          created_at: string
          id: string
          institution_id: string | null
          is_active: boolean | null
          payout_details: Json | null
          payout_method: string | null
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          payout_details?: Json | null
          payout_method?: string | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number | null
          created_at?: string
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          payout_details?: Json | null
          payout_method?: string | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "partner_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_verifications: {
        Row: {
          certificate_id: string
          id: string
          verified_at: string
          verified_by_country: string | null
          verified_by_ip: string | null
        }
        Insert: {
          certificate_id: string
          id?: string
          verified_at?: string
          verified_by_country?: string | null
          verified_by_ip?: string | null
        }
        Update: {
          certificate_id?: string
          id?: string
          verified_at?: string
          verified_by_country?: string | null
          verified_by_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_verifications_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          badge_image_url: string | null
          badge_type: string | null
          certificate_code: string
          class_group_id: string | null
          course_id: string | null
          download_url: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          issued_at: string
          issuer_logo: string | null
          issuer_name: string | null
          metadata: Json | null
          qr_code_url: string | null
          share_count: number | null
          skills: string[] | null
          user_id: string
          verification_url: string | null
        }
        Insert: {
          badge_image_url?: string | null
          badge_type?: string | null
          certificate_code: string
          class_group_id?: string | null
          course_id?: string | null
          download_url?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          issued_at?: string
          issuer_logo?: string | null
          issuer_name?: string | null
          metadata?: Json | null
          qr_code_url?: string | null
          share_count?: number | null
          skills?: string[] | null
          user_id: string
          verification_url?: string | null
        }
        Update: {
          badge_image_url?: string | null
          badge_type?: string | null
          certificate_code?: string
          class_group_id?: string | null
          course_id?: string | null
          download_url?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          issued_at?: string
          issuer_logo?: string | null
          issuer_name?: string | null
          metadata?: Json | null
          qr_code_url?: string | null
          share_count?: number | null
          skills?: string[] | null
          user_id?: string
          verification_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_class_group_id_fkey"
            columns: ["class_group_id"]
            isOneToOne: false
            referencedRelation: "class_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_group_id: string
          enrolled_at: string
          id: string
          paid_at: string | null
          payment_amount: number | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          user_id: string
        }
        Insert: {
          class_group_id: string
          enrolled_at?: string
          id?: string
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          user_id: string
        }
        Update: {
          class_group_id?: string
          enrolled_at?: string
          id?: string
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_group_id_fkey"
            columns: ["class_group_id"]
            isOneToOne: false
            referencedRelation: "class_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      class_groups: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          format: string
          id: string
          instructor: string | null
          price_aoa: number
          schedule: string
          spots: number
          start_date: string | null
          title: string
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          format?: string
          id?: string
          instructor?: string | null
          price_aoa: number
          schedule: string
          spots?: number
          start_date?: string | null
          title: string
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          format?: string
          id?: string
          instructor?: string | null
          price_aoa?: number
          schedule?: string
          spots?: number
          start_date?: string | null
          title?: string
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          paid_at: string | null
          payment_amount: number | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lessons: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          is_live: boolean | null
          live_scheduled_at: string | null
          live_status: string | null
          live_viewers: number | null
          module_id: string
          order_index: number
          title: string
          updated_at: string
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_live?: boolean | null
          live_scheduled_at?: string | null
          live_status?: string | null
          live_viewers?: number | null
          module_id: string
          order_index?: number
          title: string
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_live?: boolean | null
          live_scheduled_at?: string | null
          live_status?: string | null
          live_viewers?: number | null
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          image_url: string | null
          level: string | null
          modules: number | null
          price_aoa: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          level?: string | null
          modules?: number | null
          price_aoa: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_url?: string | null
          level?: string | null
          modules?: number | null
          price_aoa?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          background_image_url: string
          created_by: string
          creator: string
          date: string
          description: string
          id: string
          target_date: string
          time: string
          title: string
        }
        Insert: {
          address: string
          background_image_url: string
          created_by?: string
          creator: string
          date: string
          description: string
          id?: string
          target_date: string
          time: string
          title: string
        }
        Update: {
          address?: string
          background_image_url?: string
          created_by?: string
          creator?: string
          date?: string
          description?: string
          id?: string
          target_date?: string
          time?: string
          title?: string
        }
        Relationships: []
      }
      external_participants: {
        Row: {
          academic_info: string | null
          age: number
          company: string | null
          email: string
          employment_status: string | null
          event_id: string
          full_name: string
          id: string
          id_number: string
          job_title: string | null
          phone: string
          registered_at: string
        }
        Insert: {
          academic_info?: string | null
          age: number
          company?: string | null
          email: string
          employment_status?: string | null
          event_id: string
          full_name: string
          id?: string
          id_number: string
          job_title?: string | null
          phone: string
          registered_at?: string
        }
        Update: {
          academic_info?: string | null
          age?: number
          company?: string | null
          email?: string
          employment_status?: string | null
          event_id?: string
          full_name?: string
          id?: string
          id_number?: string
          job_title?: string | null
          phone?: string
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string
          progress_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id: string
          progress_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string
          progress_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          id: string
          is_host: boolean | null
          joined_at: string
          left_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_host?: boolean | null
          joined_at?: string
          left_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_host?: boolean | null
          joined_at?: string
          left_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "meeting_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_rooms: {
        Row: {
          allow_recording: boolean | null
          allow_screen_share: boolean | null
          created_at: string
          duration_minutes: number | null
          host_id: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          meeting_type: string | null
          name: string
          related_id: string | null
          room_code: string
          scheduled_at: string | null
        }
        Insert: {
          allow_recording?: boolean | null
          allow_screen_share?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          host_id: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          meeting_type?: string | null
          name: string
          related_id?: string | null
          room_code: string
          scheduled_at?: string | null
        }
        Update: {
          allow_recording?: boolean | null
          allow_screen_share?: boolean | null
          created_at?: string
          duration_minutes?: number | null
          host_id?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          meeting_type?: string | null
          name?: string
          related_id?: string | null
          room_code?: string
          scheduled_at?: string | null
        }
        Relationships: []
      }
      mentorship_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          mentorship_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentorship_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentorship_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_chat_messages_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "mentorship_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mentorship_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_enrollments: {
        Row: {
          enrolled_at: string
          id: string
          mentorship_id: string
          paid_at: string | null
          payment_amount: number | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          user_id: string
        }
        Insert: {
          enrolled_at?: string
          id?: string
          mentorship_id: string
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          user_id: string
        }
        Update: {
          enrolled_at?: string
          id?: string
          mentorship_id?: string
          paid_at?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_enrollments_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_lessons: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          mentorship_id: string
          order_index: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          mentorship_id: string
          order_index?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          mentorship_id?: string
          order_index?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_lessons_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_materials: {
        Row: {
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          lesson_id: string | null
          mentorship_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          lesson_id?: string | null
          mentorship_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          lesson_id?: string | null
          mentorship_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "mentorship_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_materials_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_weeks: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_students: number | null
          mentor_id: string
          price_aoa: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_students?: number | null
          mentor_id: string
          price_aoa?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_students?: number | null
          mentor_id?: string
          price_aoa?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_institutions: {
        Row: {
          commission_rate: number | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          commission_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          commission_rate?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_info: string | null
          address: string | null
          age: number | null
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          company: string | null
          created_at: string
          display_name: string | null
          employment_status: string | null
          full_name: string | null
          gender: string | null
          id: string
          id_number: string | null
          job_title: string | null
          phone: string | null
          province: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_info?: string | null
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          employment_status?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          id_number?: string | null
          job_title?: string | null
          phone?: string | null
          province?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_info?: string | null
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          employment_status?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          id_number?: string | null
          job_title?: string | null
          phone?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webinar_registrations: {
        Row: {
          attended: boolean | null
          attended_minutes: number | null
          id: string
          payment_reference: string | null
          payment_status: string | null
          registered_at: string
          reminder_sent: boolean | null
          user_id: string
          webinar_id: string
        }
        Insert: {
          attended?: boolean | null
          attended_minutes?: number | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          registered_at?: string
          reminder_sent?: boolean | null
          user_id: string
          webinar_id: string
        }
        Update: {
          attended?: boolean | null
          attended_minutes?: number | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          registered_at?: string
          reminder_sent?: boolean | null
          user_id?: string
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_registrations_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          host_id: string
          id: string
          is_free: boolean | null
          is_live: boolean | null
          is_recorded: boolean | null
          max_participants: number | null
          price_aoa: number | null
          replay_url: string | null
          scheduled_at: string
          started_at: string | null
          status: string | null
          stream_key: string | null
          stream_platform: string | null
          stream_url: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          host_id: string
          id?: string
          is_free?: boolean | null
          is_live?: boolean | null
          is_recorded?: boolean | null
          max_participants?: number | null
          price_aoa?: number | null
          replay_url?: string | null
          scheduled_at: string
          started_at?: string | null
          status?: string | null
          stream_key?: string | null
          stream_platform?: string | null
          stream_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          host_id?: string
          id?: string
          is_free?: boolean | null
          is_live?: boolean | null
          is_recorded?: boolean | null
          max_participants?: number | null
          price_aoa?: number | null
          replay_url?: string | null
          scheduled_at?: string
          started_at?: string | null
          status?: string | null
          stream_key?: string | null
          stream_platform?: string | null
          stream_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
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
    }
    Enums: {
      app_role: "admin" | "user" | "mentor" | "moderator"
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
      app_role: ["admin", "user", "mentor", "moderator"],
    },
  },
} as const
