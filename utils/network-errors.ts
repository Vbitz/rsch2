export interface NetworkError {
  message: string;
  isRetryable: boolean;
}

export function getNetworkErrorMessage(error: unknown, context: string): NetworkError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: `Unable to connect to Semantic Scholar API. Please check your internet connection and try again.`,
      isRetryable: true
    };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network connectivity issues
    if (message.includes('network') || message.includes('failed to fetch') || message.includes('offline')) {
      return {
        message: `Network connection failed. Please check your internet connection and try again.`,
        isRetryable: true
      };
    }

    // Timeout issues
    if (message.includes('timeout') || message.includes('aborted')) {
      return {
        message: `Request timed out. The Semantic Scholar API may be slow. Please try again.`,
        isRetryable: true
      };
    }
  }

  return {
    message: `An unexpected error occurred while ${context}. Please try again.`,
    isRetryable: true
  };
}

export async function getHttpErrorMessage(response: Response, context: string): Promise<NetworkError> {
  const status = response.status;
  
  // Try to read the plain text error response from the server
  let serverErrorText = '';
  try {
    serverErrorText = await response.text();
  } catch (e) {
    // If we can't read the response body, fall back to status text
    serverErrorText = response.statusText;
  }

  // Use server error text if available and meaningful
  if (serverErrorText && serverErrorText.trim() && serverErrorText !== response.statusText) {
    const isRetryable = status === 429 || status >= 500;
    return {
      message: serverErrorText.trim(),
      isRetryable
    };
  }

  // Fall back to our custom messages for common status codes
  switch (status) {
    case 400:
      return {
        message: `Invalid request. Please check your search terms and try again.`,
        isRetryable: false
      };
    
    case 401:
      return {
        message: `Authentication failed with Semantic Scholar API. Please try again later.`,
        isRetryable: false
      };
    
    case 403:
      return {
        message: `Access denied by Semantic Scholar API. You may have exceeded usage limits.`,
        isRetryable: false
      };
    
    case 404:
      return {
        message: `The requested paper was not found on Semantic Scholar.`,
        isRetryable: false
      };
    
    case 429:
      return {
        message: `Too many requests. Semantic Scholar is rate limiting. Please wait a moment and try again.`,
        isRetryable: true
      };
    
    case 500:
    case 502:
    case 503:
      return {
        message: `Semantic Scholar API is temporarily unavailable. Please try again in a few minutes.`,
        isRetryable: true
      };
    
    case 504:
      return {
        message: `Request timed out. Semantic Scholar API is responding slowly. Please try again.`,
        isRetryable: true
      };
    
    default:
      if (status >= 400 && status < 500) {
        return {
          message: `Client error (${status}): ${response.statusText}. Please check your request and try again.`,
          isRetryable: false
        };
      } else if (status >= 500) {
        return {
          message: `Server error (${status}): Semantic Scholar API is having issues. Please try again later.`,
          isRetryable: true
        };
      } else {
        return {
          message: `Unexpected response (${status}) while ${context}. Please try again.`,
          isRetryable: true
        };
      }
  }
}

export async function handleNetworkError(error: unknown, response?: Response, context: string = 'processing your request'): Promise<NetworkError> {
  // Handle HTTP response errors
  if (response && !response.ok) {
    return await getHttpErrorMessage(response, context);
  }
  
  // Handle network/fetch errors
  return getNetworkErrorMessage(error, context);
}