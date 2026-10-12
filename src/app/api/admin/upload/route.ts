// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin: Multiple Product Photo Upload API
// POST /api/admin/upload
// Uploads multiple product photos in one go to Supabase Storage 'products' bucket
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase configuration in environment variables');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const BUCKET_NAME = 'products';

// Ensure bucket exists
async function ensureBucket(supabase: any) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', 'image/gif'],
      });
    }
  } catch (e) {
    console.warn('Bucket verification warning:', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    await ensureBucket(supabase);

    const formData = await req.formData();
    // Support both 'files' (multiple) and 'file' (single)
    let files = formData.getAll('files') as File[];
    if (files.length === 0) {
      const single = formData.get('file') as File | null;
      if (single) files = [single];
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files were provided for upload.' },
        { status: 400 }
      );
    }

    const uploadedUrls: { url: string; name: string; size: number }[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename & create unique path
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanBaseName = file.name
          .replace(/\.[^/.]+$/, '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .slice(0, 30);
        const uniqueId = crypto.randomUUID().slice(0, 8);
        const filePath = `${Date.now()}-${uniqueId}-${cleanBaseName}.${ext}`;

        const contentType = file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;

        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, buffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push({
            url: publicUrlData.publicUrl,
            name: file.name,
            size: file.size,
          });
        }
      } catch (fileErr: any) {
        console.error(`Error processing file ${file.name}:`, fileErr);
        errors.push(`${file.name}: ${fileErr.message}`);
      }
    }

    if (uploadedUrls.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload images', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''}!`,
      count: uploadedUrls.length,
      urls: uploadedUrls.map(u => u.url),
      images: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error('Photo upload route exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during upload.' },
      { status: 500 }
    );
  }
}
