export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          item: string
          amount: number
          expense_date: string
          notes: string | null
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          item: string
          amount: number
          expense_date: string
          notes?: string | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          item?: string
          amount?: number
          expense_date?: string
          notes?: string | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          month: number
          year: number
          alert_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          month: number
          year: number
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          month?: number
          year?: number
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          item: string
          amount: number | null
          notes: string | null
          usage_count: number
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          item: string
          amount?: number | null
          notes?: string | null
          usage_count?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          name?: string
          item?: string
          amount?: number | null
          notes?: string | null
          usage_count?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_parsing_logs: {
        Row: {
          id: string
          user_id: string
          input_text: string
          parsed_result: Json | null
          success: boolean
          error_message: string | null
          processing_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input_text: string
          parsed_result?: Json | null
          success?: boolean
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          input_text?: string
          parsed_result?: Json | null
          success?: boolean
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          dark_mode: boolean
          currency: string
          date_format: string
          default_category_id: string | null
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          dark_mode?: boolean
          currency?: string
          date_format?: string
          default_category_id?: string | null
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          dark_mode?: boolean
          currency?: string
          date_format?: string
          default_category_id?: string | null
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      expenses_with_category: {
        Row: {
          id: string
          user_id: string
          item: string
          amount: number
          expense_date: string
          notes: string | null
          is_template: boolean
          created_at: string
          updated_at: string
          category_id: string | null
          category_name: string | null
          category_icon: string | null
          category_color: string | null
        }
      }
      daily_expense_summary: {
        Row: {
          user_id: string
          expense_date: string
          transaction_count: number
          total_amount: number
          categories_used: string[]
        }
      }
      monthly_category_expenses: {
        Row: {
          user_id: string
          category_id: string | null
          year: number
          month: number
          transaction_count: number
          total_amount: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
