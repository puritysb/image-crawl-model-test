import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js';

// Define ImageMetadata interface directly for this API route
interface ImageMetadata {
  id?: string;
  url: string;
  alt_text?: string;
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  source_url?: string;
  crawl_date?: string;
  tags?: string[];
  keyword?: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';

    let query = supabase.from('image_metadata').select('url, alt_text, keyword');
    if (keyword) {
      query = query.or(`alt_text.ilike.%${keyword}%,tags.cs.{"${keyword}"},keyword.ilike.%${keyword}%`);
    }

    const { data: imagesToDownload, error } = await query;

    if (error) {
      console.error('Error fetching images from Supabase:', error);
      return NextResponse.json({ error: 'Failed to fetch images from database' }, { status: 500 });
    }

    if (!imagesToDownload || imagesToDownload.length === 0) {
      return NextResponse.json({ error: 'No images found for the given keyword.' }, { status: 404 });
    }

    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    const downloadPromises = imagesToDownload.map(async (imgData: ImageMetadata, index: number) => {
      const imgUrl = imgData.url;
      if (!imgUrl) {
        console.warn(`Skipping image with no URL: ${imgData.alt_text}`);
        return null;
      }

      try {
        const response = await fetch(imgUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image from ${imgUrl}: ${response.statusText}`);
        }
        const blob = await response.blob();
        
        // Determine filename
        let filename = imgUrl.substring(imgUrl.lastIndexOf('/') + 1).split('?')[0];
        if (!filename || filename.indexOf('.') === -1) {
          // Fallback if filename is not clear from URL
          filename = `${imgData.keyword || 'image'}_${index}.${blob.type.split('/')[1] || 'jpg'}`;
        }

        await zipWriter.add(filename, new BlobReader(blob));
        return filename;
      } catch (e) {
        console.error(`Error downloading or adding image ${imgUrl} to zip:`, e);
        return null;
      }
    });

    await Promise.allSettled(downloadPromises);

    const zipBlob = await zipWriter.close();

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', 'attachment; filename="filtered_images.zip"');

    return new NextResponse(zipBlob, { status: 200, headers });

  } catch (error: unknown) {
    console.error('Error generating zip file in Next.js API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
