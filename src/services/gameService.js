function tryParseJson(text) {
  if (!text) return null;
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    }
  } catch (e) {
    console.error('Failed to parse AI response as JSON in service:', e);
  }
  return { description: text, choices: null };
}

export const fetchEventFromApi = async (promptContext) => {
  console.log('Fetching event with context:', promptContext);

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptContext }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }
      throw new Error(
        errorData?.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    if (typeof data === 'string') {
      console.warn('API returned raw string, attempting to parse:', data);
      return tryParseJson(data);
    }

    if (!data || typeof data.description !== 'string') {
      console.warn('Received invalid data structure from API:', data);
      return {
        description: data?.description || 'Received unclear instructions.',
        choices: data?.choices || null,
      };
    }

    console.log('Received structured data from API:', data);
    return data;
  } catch (error) {
    console.error('Error in gameService fetchEventFromApi:', error);
    throw new Error(`Failed to fetch event data: ${error.message}`);
  }
};
