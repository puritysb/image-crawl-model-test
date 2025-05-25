import React from 'react';
import { supabase } from '@/lib/supabase';
import { CrawlJob } from '@shared/types';

export default async function DashboardPage() {
  let totalImages = 0;
  let totalCrawlJobs = 0;
  let recentCrawlJobs: CrawlJob[] = [];

  try {
    // Fetch total image count
    const { count: imagesCount, error: imagesError } = await supabase
      .from('image_metadata')
      .select('*', { count: 'exact', head: true });
    
    if (imagesError) {
      console.error('Error fetching image count:', imagesError);
    } else {
      totalImages = imagesCount || 0;
    }

    // Fetch total crawl job count
    const { count: jobsCount, error: jobsError } = await supabase
      .from('crawl_jobs')
      .select('*', { count: 'exact', head: true });

    if (jobsError) {
      console.error('Error fetching crawl job count:', jobsError);
    } else {
      totalCrawlJobs = jobsCount || 0;
    }

    // Fetch recent crawl jobs
    const { data: jobsData, error: recentJobsError } = await supabase
      .from('crawl_jobs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(5);

    if (recentJobsError) {
      console.error('Error fetching recent crawl jobs:', recentJobsError);
    } else {
      recentCrawlJobs = jobsData as CrawlJob[]; // Now types match directly
    }

  } catch (error) {
    console.error('Error in DashboardPage data fetching:', error);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Images</h2>
          <p className="text-4xl font-bold text-blue-600">{totalImages}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Crawl Jobs</h2>
          <p className="text-4xl font-bold text-green-600">{totalCrawlJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Model Test Runs</h2>
          <p className="text-4xl font-bold text-purple-600">N/A</p> {/* Placeholder */}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Crawl Jobs</h2>
        {recentCrawlJobs.length === 0 ? (
          <p className="text-gray-500">No recent crawl jobs found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentCrawlJobs.map((job) => (
              <li key={job.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-900">{job.target_url}</p>
                  <p className="text-sm text-gray-500">
                    Status: <span className={`font-semibold ${job.status === 'completed' ? 'text-green-500' : job.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>{job.status}</span>
                  </p>
                  <p className="text-sm text-gray-500">Images: {job.image_count}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(job.start_time).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Data Trends (Placeholder)</h2>
        <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">
          Chart/Graph Placeholder
        </div>
      </div>
    </div>
  );
}
