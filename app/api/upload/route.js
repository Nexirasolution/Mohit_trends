import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Route segment config: raise the body size limit for this route since
// bulk product uploads can involve larger image files than the default allows.
export const runtime = 'nodejs';
export const maxDuration = 60; // seconds, in case Cloudinary is slow on large files

export async function POST(req) {
  try {
    // Fail fast with a clear error if env vars are missing, instead of a
    // confusing auth error from Cloudinary further down.
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error('Missing Cloudinary env vars');
      return NextResponse.json(
        { error: 'Server is missing Cloudinary configuration' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file upload' }, { status: 400 });
    }

    // Basic type check — reject non-images early with a clear message.
    if (file.type && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Guard against oversized files rather than letting Cloudinary reject them
    // with a less clear error. Adjust the limit to match your Cloudinary plan.
    const MAX_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — max allowed is ${MAX_BYTES / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, resource_type: 'auto' }, // 'auto' handles both image and video
          (err, res) => (err ? reject(err) : resolve(res))
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 }
    );
  }
}