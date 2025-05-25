"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CrawlJob, Database } from '@shared/types';

export default function CrawlerPage() {
  const [keyword, setKeyword] = useState('');
  const [limit, setLimit] = useState(10); // Number of images to collect
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [crawlJobs, setCrawlJobs] = useState<CrawlJob[]>([]);

  const fetchCrawlJobs = async () => {
    const { data, error } = await supabase
      .from('crawl_jobs')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching crawl jobs:', error);
    } else {
      // Convert snake_case to camelCase for TypeScript type compatibility
      setCrawlJobs(data as CrawlJob[]); // Now types match directly
    }
  };

  useEffect(() => {
    fetchCrawlJobs();

    // Set up real-time subscription for crawl_jobs table
    const channel = supabase
      .channel('crawl_jobs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crawl_jobs' },
        (payload: any) => { // Temporarily set to any to resolve type error
          console.log('Change received!', payload);
          fetchCrawlJobs(); // Re-fetch jobs on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Call Next.js API route which proxies to FastAPI
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, limit }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start image search job.');
      }

      const data = await response.json();
      setMessage(`Image search job started successfully! Job ID: ${data.job_id}`);
      setKeyword('');
      setLimit(10);
      fetchCrawlJobs(); // Refresh job list immediately
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      console.error('Error starting image search job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this crawl job?')) {
      return;
    }
    try {
      const { error } = await supabase.from('crawl_jobs').delete().eq('id', jobId);
      if (error) {
        throw new Error(error.message);
      }
      setMessage(`Crawl job ${jobId} deleted successfully.`);
      fetchCrawlJobs(); // Refresh job list
    } catch (error: any) {
      setMessage(`Error deleting job: ${error.message}`);
      console.error('Error deleting crawl job:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Search & Collection</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Start New Image Search Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
              Keyword
            </label>
            <input
              type="text"
              id="keyword"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700">
              Number of Images to Collect
            </label>
            <input
              type="number"
              id="limit"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              min="1"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Image Search'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Active & Recent Crawl Jobs</h2>
        {crawlJobs.length === 0 ? (
          <p className="text-gray-500">No crawl jobs found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {crawlJobs.map((job) => (
              <li key={job.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-900">{job.target_url}</p>
                  <p className="text-sm text-gray-500">
                    Status: <span className={`font-semibold ${job.status === 'completed' ? 'text-green-500' : job.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>{job.status}</span>
                  </p>
                  <p className="text-sm text-gray-500">Images: {job.image_count}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Started: {new Date(job.start_time).toLocaleString()}
                    {job.end_time && ` | Ended: ${new Date(job.end_time).toLocaleString()}`}
                  </span>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                    title="Delete Job"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
