//URL mapping
export interface UrlMapping {
    id: string;
    originalUrl: string;
    shortenedCode: string;
    createdAt: Date;
  }

  export interface ShortenUrlRequest {
    url: string;
  }
  
  export interface ShortenUrlResponse {
    shortenedURL: string;
  }