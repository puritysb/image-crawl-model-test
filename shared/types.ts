// shared/types.ts
// Common TypeScript types and interfaces for the dashboard and potentially for API communication.

export interface ImageMetadata {
  id: string;
  url: string;
  alt_text?: string; // snake_case to match Supabase
  width?: number;
  height?: number;
  size?: number; // in bytes
  format?: string;
  source_url: string; // snake_case to match Supabase
  crawl_date: string; // ISO 8601 string (snake_case to match Supabase)
  tags?: string[];
  model_test_results?: ModelTestResult[]; // snake_case to match Supabase
  keyword?: string; // Keyword used to find this image
}

export interface ModelTestResult {
  modelId: string;
  modelName: string;
  version: string;
  testDate: string; // ISO 8601 string
  result: 'pass' | 'fail' | 'error';
  score?: number;
  details?: Record<string, any>; // Flexible field for model-specific results
}

export interface CrawlJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  start_time: string; // ISO 8601 string (snake_case to match Supabase)
  end_time?: string; // ISO 8601 string (snake_case to match Supabase)
  target_url: string; // snake_case to match Supabase
  crawl_depth: number; // snake_case to match Supabase
  image_count: number; // snake_case to match Supabase
  errors?: string[];
  pid?: number; // Process ID for tracking (optional)
}

// Supabase table types (example)
export type Database = {
  public: {
    Tables: {
      image_metadata: {
        Row: ImageMetadata;
        Insert: Omit<ImageMetadata, 'id' | 'crawl_date'> & { crawl_date?: string };
        Update: Partial<ImageMetadata>;
      };
      model_test_results: {
        Row: ModelTestResult;
        Insert: Omit<ModelTestResult, 'test_date'> & { test_date?: string };
        Update: Partial<ModelTestResult>;
      };
      crawl_jobs: {
        Row: CrawlJob;
        Insert: Omit<CrawlJob, 'id' | 'start_time'> & { start_time?: string };
        Update: Partial<CrawlJob>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
