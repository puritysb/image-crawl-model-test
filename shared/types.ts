// shared/types.ts
// Common TypeScript types and interfaces for the dashboard and potentially for API communication.

export interface ImageMetadata {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  size?: number; // in bytes
  format?: string;
  sourceUrl: string;
  crawlDate: string; // ISO 8601 string
  tags?: string[];
  modelTestResults?: ModelTestResult[];
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
  startTime: string; // ISO 8601 string
  endTime?: string; // ISO 8601 string
  targetUrl: string;
  crawlDepth: number;
  imageCount: number;
  errors?: string[];
}

// Supabase table types (example)
export type Database = {
  public: {
    Tables: {
      image_metadata: {
        Row: ImageMetadata;
        Insert: Omit<ImageMetadata, 'id' | 'crawlDate'> & { crawlDate?: string };
        Update: Partial<ImageMetadata>;
      };
      model_test_results: {
        Row: ModelTestResult;
        Insert: Omit<ModelTestResult, 'testDate'> & { testDate?: string };
        Update: Partial<ModelTestResult>;
      };
      crawl_jobs: {
        Row: CrawlJob;
        Insert: Omit<CrawlJob, 'id' | 'startTime'> & { startTime?: string };
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
