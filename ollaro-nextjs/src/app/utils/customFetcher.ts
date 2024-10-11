export const customFetch = async (url: string, 
        options: RequestInit = {}) => {
  try {
    
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    if(token === null){
        // Create a 401-like response manually
        return new Response(null, {
            status: 401,
            statusText: 'Unauthorized',
        });
    }
    // Include the token in the Authorization header if available
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    // Set the updated headers
    const updatedOptions: RequestInit = {
      ...options,
      headers,
    };

    // Make the fetch request with the updated options
    const response = await fetch(url, updatedOptions);
    
    if (response.status === 401) {
      // If 401 Unauthorized, redirect to login page
      return response;
    }

    // If successful, return the response
    return response;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
};