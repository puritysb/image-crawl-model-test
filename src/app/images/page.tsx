"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ImageMetadata } from '@shared/types';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import XMarkIcon for close button

export default function ImagesPage() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 'desc' for newest first
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);

  const fetchImages = React.useCallback(async () => {
    setLoading(true);
    let query = supabase.from('image_metadata').select('*');

    if (filterKeyword) {
      // Search in alt_text and tags (assuming tags are stored as text[])
      query = query.or(`alt_text.ilike.%${filterKeyword}%,tags.cs.{"${filterKeyword}"},keyword.ilike.%${filterKeyword}%`);
    }

    query = query.order('crawl_date', { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching images:', error);
    } else {
      // Sort by crawl_date based on sortOrder
      const sortedData = (data as ImageMetadata[]).sort((a, b) => {
        const dateA = new Date(a.crawl_date).getTime();
        const dateB = new Date(b.crawl_date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      setImages(sortedData);
    }
    setLoading(false);
  }, [filterKeyword, sortOrder]);

  useEffect(() => {
    fetchImages();

    // Optional: Real-time subscription for image_metadata changes
    const channel = supabase
      .channel('image_metadata_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'image_metadata' },
        (payload: any) => { // Temporarily set to any to resolve type error
          console.log('Image change received!', payload);
          fetchImages(); // Re-fetch images on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterKeyword, sortOrder, fetchImages]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [selectedImage]); // Re-run when selectedImage changes

  const handleImageClick = (image: ImageMetadata) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownloadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/images/download?keyword=${filterKeyword}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download images.');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'filtered_images.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Images downloaded successfully!');
    } catch (error: any) {
      alert(`Error downloading images: ${error.message}`);
      console.error('Error downloading images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Collected Images</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Filter by keyword..."
          className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
          value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-md shadow-sm p-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        <button
          onClick={fetchImages}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
        >
          Apply Filter/Sort
        </button>
        <button
          onClick={handleDownloadImages}
          className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50"
          disabled={loading || images.length === 0}
        >
          Download Filtered Images ({images.length})
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-center text-gray-500">No images found. Try collecting some!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleImageClick(image)}
            >
              <div className="relative w-full h-48">
                <Image
                  src={image.url}
                  alt={image.alt_text || 'Collected image'}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 truncate">{image.alt_text || 'No alt text'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Keyword: <span className="font-medium text-gray-700">{image.keyword || 'N/A'}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Source: {image.source_url ? new URL(image.source_url).hostname : 'N/A'}
                </p>
                <p className="text-xs text-gray-500">
                  Date: {new Date(image.crawl_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-4 rounded-lg max-w-3xl max-h-full overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl p-1 rounded-full hover:bg-gray-100"
              onClick={handleCloseModal}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt_text || 'Collected image'}
              width={selectedImage.width || 800}
              height={selectedImage.height || 600}
              objectFit="contain"
              className="max-w-full max-h-[80vh]"
            />
            <div className="mt-4 text-sm text-gray-700">
              <p><strong>URL:</strong> <a href={selectedImage.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedImage.url}</a></p>
              <p><strong>Source URL:</strong> <a href={selectedImage.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedImage.source_url}</a></p>
              <p><strong>Alt Text:</strong> {selectedImage.alt_text || 'N/A'}</p>
              <p><strong>Keyword:</strong> {selectedImage.keyword || 'N/A'}</p>
              <p><strong>Dimensions:</strong> {selectedImage.width}x{selectedImage.height}</p>
              <p><strong>Format:</strong> {selectedImage.format || 'N/A'}</p>
              <p><strong>Crawl Date:</strong> {new Date(selectedImage.crawl_date).toLocaleString()}</p>
              <p><strong>Tags:</strong> {selectedImage.tags && selectedImage.tags.length > 0 ? selectedImage.tags.join(', ') : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
