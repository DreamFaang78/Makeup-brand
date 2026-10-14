// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Admin Media API
// GET /api/admin/media
// Returns the real list of image files in /public for admin picker chips
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);

    const imageExtensions = ['.jpeg', '.jpg', '.png', '.webp', '.svg'];
    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map((file) => `/${file}`)
      .sort((a, b) => {
        // Prioritize lanan- product banners first
        if (a.includes('lanan-') && !b.includes('lanan-')) return -1;
        if (!a.includes('lanan-') && b.includes('lanan-')) return 1;
        return a.localeCompare(b);
      });

    return NextResponse.json({ success: true, files: imageFiles });
  } catch (err: any) {
    console.error('Error listing public images:', err);
    return NextResponse.json({ success: false, files: [] }, { status: 500 });
  }
}
