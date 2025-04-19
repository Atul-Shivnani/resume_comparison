import axios from 'axios';

// Helper function to fetch the text content of a URL
async function fetchTextFromUrl(url) {
  try {
    const response = await axios.get(url);
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  } catch (error) {
    console.error("Error fetching text from URL:", error.response?.status, error.message);
    throw new Error(`Failed to fetch text from URL: ${error.message}`);
  }
}

// Helper function to sanitize and parse JSON
function parseJsonSafely(content) {
  try {
    // Remove any potential markdown formatting
    let cleanContent = content
      .replace(/```json\s*/g, '')
      .replace(/```/g, '')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .trim();

    // Log the cleaned content for debugging
    console.log("Cleaned content before parsing:", cleanContent);

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.error("Raw content:", content);
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

// Function to compare documents using Mistral API
async function compareDocumentsWithMistral(sampleText, uploadedText) {
  try {
    if (!sampleText || !uploadedText) {
      throw new Error('Sample text and uploaded text are required');
    }

    const prompt = `
    Compare these two documents and provide a detailed analysis in JSON format:

    SAMPLE DOCUMENT:
    ${sampleText}

    UPLOADED DOCUMENT:
    ${uploadedText}

    Respond with a JSON object that includes:
    1. A numerical similarity score between 0-100
    2. Key differences between the documents
    3. Specific feedback for improvements

    Format your response EXACTLY like this example:
    {
      "similarity_score": 85,
      "differences": {
        "missing_content": ["list of missing items"],
        "additional_content": ["list of extra items"],
        "formatting_issues": ["list of format differences"]
      },
      "improvement_suggestions": ["list of suggestions"]
    }

    RESPOND ONLY WITH THE JSON OBJECT, NO OTHER TEXT.`;

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You are a document comparison expert. Always respond with valid JSON objects following the exact format specified.'
          },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error("Unexpected API response structure:", response.data);
      throw new Error('Invalid API response structure');
    }

    // Parse the response
    const result = parseJsonSafely(response.data.choices[0].message.content);

    // Normalize the response structure
    const normalizedResult = {
      match_score: result.similarity_score || result.match_score || 0,
      differences: result.differences || result.section_wise_comparison || {},
      feedback: result.improvement_suggestions || result.feedback || []
    };

    return normalizedResult;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Mistral API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(`Mistral API error: ${error.response?.status || error.message}`);
    }
    throw error;
  }
}

// Main API route handler
export async function POST(req) {
  try {
    const { sampleUrl, uploadedUrl } = await req.json();

    if (!sampleUrl || !uploadedUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required URLs',
          details: {
            sampleUrl: !sampleUrl ? 'missing' : 'provided',
            uploadedUrl: !uploadedUrl ? 'missing' : 'provided'
          }
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch texts in parallel
    const [sampleText, uploadedText] = await Promise.all([
      fetchTextFromUrl(sampleUrl),
      fetchTextFromUrl(uploadedUrl)
    ]);

    // Get comparison result
    const comparisonResult = await compareDocumentsWithMistral(sampleText, uploadedText);
console.log(comparisonResult)
    return new Response(
      JSON.stringify(comparisonResult),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error in POST request:", error);
    
    return new Response(
      JSON.stringify({
        error: 'Document comparison failed',
        message: error.message,
        timestamp: new Date().toISOString(),
        // Include stack trace in development
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}