import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract OpenGraph and basic meta tags
    const ogData = extractMetadata(html);

    return NextResponse.json({
      success: true,
      data: ogData,
    });
  } catch (error) {
    console.error("OpenGraph fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch page metadata" },
      { status: 500 }
    );
  }
}

function extractMetadata(html: string) {
  const metadata: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
    type?: string;
  } = {};

  // Extract OpenGraph tags
  const ogMatches = html.match(
    /<meta\s+property="og:([^"]*?)"\s+content="([^"]*?)"/gi
  );
  if (ogMatches) {
    ogMatches.forEach((match) => {
      const propertyMatch = match.match(/property="og:([^"]*)"/);
      const contentMatch = match.match(/content="([^"]*)"/);
      if (propertyMatch && contentMatch) {
        const property = propertyMatch[1];
        const content = contentMatch[1];

        switch (property) {
          case "title":
            metadata.title = content;
            break;
          case "description":
            metadata.description = content;
            break;
          case "image":
            metadata.image = content;
            break;
          case "site_name":
            metadata.siteName = content;
            break;
          case "url":
            metadata.url = content;
            break;
          case "type":
            metadata.type = content;
            break;
        }
      }
    });
  }

  // Fallback to basic meta tags if OpenGraph not available
  if (!metadata.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }
  }

  if (!metadata.description) {
    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]*?)"/i
    );
    if (descMatch) {
      metadata.description = descMatch[1];
    }
  }

  // Clean up data
  if (metadata.title) {
    metadata.title = metadata.title
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
  }
  if (metadata.description) {
    metadata.description = metadata.description
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
  }

  return metadata;
}
