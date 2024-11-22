// app/api/convert/route.js

import { NextResponse } from 'next/server';
import convertAndUpload from '../../actions/convert';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const sampleUrl = formData.get('sampleUrl')

    // Validate if file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Call the server action to handle the upload and conversion
    const response = await convertAndUpload(file, sampleUrl);
console.log("response: "+JSON.stringify(response))
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { error: 'Error processing the file' },
      { status: 500 }
    );
  }
}

// Configure the API route to handle larger files
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};
