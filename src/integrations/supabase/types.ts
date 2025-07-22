export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alumni_events: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          event_type: string | null
          id: string
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          organizer_id: string
          registration_deadline: string | null
          start_date: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date?: string | null
          event_type?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_id: string
          registration_deadline?: string | null
          start_date: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          event_type?: string | null
          id?: string
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_id?: string
          registration_deadline?: string | null
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "alumni_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_job_posts: {
        Row: {
          application_deadline: string | null
          company: string
          created_at: string
          description: string
          experience_level: string | null
          id: string
          job_type: string | null
          location: string | null
          posted_by: string
          requirements: string | null
          salary_range: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          company: string
          created_at?: string
          description: string
          experience_level?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          posted_by: string
          requirements?: string | null
          salary_range?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          company?: string
          created_at?: string
          description?: string
          experience_level?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          posted_by?: string
          requirements?: string | null
          salary_range?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_job_posts_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "alumni_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_mentorship: {
        Row: {
          created_at: string
          id: string
          mentee_id: string
          mentor_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_mentorship_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "alumni_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alumni_mentorship_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "alumni_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_company: string | null
          current_position: string | null
          degree: string
          full_name: string
          graduation_year: number
          id: string
          industry: string | null
          linkedin_url: string | null
          location: string | null
          major: string | null
          updated_at: string
          user_id: string
          verification_document_url: string | null
          verification_reviewed_at: string | null
          verification_reviewed_by: string | null
          verification_status: string | null
          verification_submitted_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_company?: string | null
          current_position?: string | null
          degree: string
          full_name: string
          graduation_year: number
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          major?: string | null
          updated_at?: string
          user_id: string
          verification_document_url?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_company?: string | null
          current_position?: string | null
          degree?: string
          full_name?: string
          graduation_year?: number
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          major?: string | null
          updated_at?: string
          user_id?: string
          verification_document_url?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
        }
        Relationships: []
      }
      alumni_verification_documents: {
        Row: {
          alumni_id: string
          document_type: string
          document_url: string
          id: string
          status: string | null
          uploaded_at: string
        }
        Insert: {
          alumni_id: string
          document_type: string
          document_url: string
          id?: string
          status?: string | null
          uploaded_at?: string
        }
        Update: {
          alumni_id?: string
          document_type?: string
          document_url?: string
          id?: string
          status?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_verification_documents_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "alumni_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          member_count: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          member_count?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          member_count?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          addressee_id: string
          created_at: string | null
          id: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addressee_id: string
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string | null
          gig_id: string
          id: string
          proposed_rate: number | null
          status: string | null
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string | null
          gig_id: string
          id?: string
          proposed_rate?: number | null
          status?: string | null
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string | null
          gig_id?: string
          id?: string
          proposed_rate?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_applications_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          applicants_count: number | null
          created_at: string | null
          description: string
          duration: string | null
          id: string
          location_type: string | null
          price_amount: number
          price_type: string | null
          skills: string[] | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applicants_count?: number | null
          created_at?: string | null
          description: string
          duration?: string | null
          id?: string
          location_type?: string | null
          price_amount: number
          price_type?: string | null
          skills?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applicants_count?: number | null
          created_at?: string | null
          description?: string
          duration?: string | null
          id?: string
          location_type?: string | null
          price_amount?: number
          price_type?: string | null
          skills?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gigs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          category: string | null
          created_at: string
          deadline: string | null
          description: string
          experience_level: string | null
          id: string
          location: string | null
          location_type: string | null
          skills: string[] | null
          status: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          experience_level?: string | null
          id?: string
          location?: string | null
          location_type?: string | null
          skills?: string[] | null
          status?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          experience_level?: string | null
          id?: string
          location?: string | null
          location_type?: string | null
          skills?: string[] | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          badges: string[] | null
          bio: string | null
          college_name: string | null
          college_verified: boolean | null
          created_at: string | null
          full_name: string | null
          id: string
          impersonation_policy_accepted: boolean | null
          interests: Json | null
          last_interests_update: string | null
          location: string | null
          major: string | null
          onboarding_completed: boolean | null
          portfolio: string[] | null
          rating: number | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          skills: string[] | null
          updated_at: string | null
          username: string | null
          year_of_study: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          college_name?: string | null
          college_verified?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id: string
          impersonation_policy_accepted?: boolean | null
          interests?: Json | null
          last_interests_update?: string | null
          location?: string | null
          major?: string | null
          onboarding_completed?: boolean | null
          portfolio?: string[] | null
          rating?: number | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
          year_of_study?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          college_name?: string | null
          college_verified?: boolean | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          impersonation_policy_accepted?: boolean | null
          interests?: Json | null
          last_interests_update?: string | null
          location?: string | null
          major?: string | null
          onboarding_completed?: boolean | null
          portfolio?: string[] | null
          rating?: number | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          skills?: string[] | null
          updated_at?: string | null
          username?: string | null
          year_of_study?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string | null
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          owner_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          owner_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          owner_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reply_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reply_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reply_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          ratings: number[]
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          ratings: number[]
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          ratings?: number[]
        }
        Relationships: []
      }
      saved_thoughts: {
        Row: {
          created_at: string
          id: string
          thought_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          thought_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          thought_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_thoughts_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_thoughts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      thought_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          thought_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          thought_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          thought_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thought_comments_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thought_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      thought_likes: {
        Row: {
          created_at: string | null
          id: string
          thought_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          thought_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          thought_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thought_likes_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thought_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      thoughts: {
        Row: {
          comments_count: number | null
          community_id: string | null
          community_tag: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          mentions: Json | null
          parent_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          community_id?: string | null
          community_tag?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          mentions?: Json | null
          parent_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          community_id?: string | null
          community_tag?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          mentions?: Json | null
          parent_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thoughts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thoughts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thoughts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          id: string
          karma_points: number
          last_activity_date: string | null
          level: number
          streak_days: number
          total_comments: number
          total_connections: number
          total_likes_received: number
          total_posts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          karma_points?: number
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_comments?: number
          total_connections?: number
          total_likes_received?: number
          total_posts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          karma_points?: number
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          total_comments?: number
          total_connections?: number
          total_likes_received?: number
          total_posts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      are_users_connected: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      assign_referral_code_to_user: {
        Args: { user_id: string }
        Returns: string
      }
      calculate_user_level: {
        Args: { karma_points: number }
        Returns: number
      }
      create_community_if_not_exists: {
        Args: { community_name: string; creator_id: string }
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_connection_status: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_conversations: {
        Args: { p_user_id: string }
        Returns: Database["public"]["CompositeTypes"]["conversation_details"][]
      }
      get_user_connections: {
        Args: { p_user_id: string }
        Returns: {
          connection_id: string
          partner_id: string
          partner_name: string
          partner_avatar: string
          status: string
          created_at: string
          requester_id: string
          addressee_id: string
        }[]
      }
      update_user_stats: {
        Args: {
          p_user_id: string
          p_karma_change?: number
          p_posts_change?: number
          p_likes_change?: number
          p_comments_change?: number
          p_connections_change?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      conversation_details: {
        partner_id: string | null
        full_name: string | null
        avatar_url: string | null
        last_message_content: string | null
        last_message_created_at: string | null
        is_last_message_read: boolean | null
      }
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
    Enums: {},
  },
} as const
