import { GoogleGenAI, Type } from "@google/genai";
import type { PredictionData, FullPredictionResult, CountryOverviewData, FullCountryOverviewResult, AnyPredictionResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseAndValidateJsonResponse = (responseText: string, userFacingErrorMessage: string): any => {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not find a valid JSON object in the AI response.");
    }
    const cleanedJsonText = jsonMatch[0];
    const parsedJson = JSON.parse(cleanedJsonText);

    if (parsedJson.isValidLocation === false || parsedJson.isValidCountry === false) {
        throw new Error(userFacingErrorMessage);
    }
    return parsedJson;
}

const getUniqueSources = (response: any): { uri: string; title: string }[] => {
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ uri: web.uri, title: web.title }));

    // FIX: Provide generic type arguments to `Map` to ensure correct type inference for its values.
    return Array.from(new Map<string, { uri: string; title: string }>(sources.map(s => [s.uri, s])).values());
}


export const getWeatherComfortPrediction = async (query: string): Promise<FullPredictionResult> => {
  const prompt = `
    Based on the user's query: "${query}", first identify the location and the target date.
    
    Crucially, if the location parsed from the query does not correspond to a real, known geographical location (city, country, etc.), you MUST return a single JSON object with a single key: {"isValidLocation": false}. Do not attempt to provide a forecast for nonsensical or fictional locations.

    If the location is valid, analyze real-time forecasts, satellite data, and historical climate information for that location and date using Google Search to get the most up-to-date information.
    Provide a "Weather Comfort Prediction".

    Your final output for a valid location MUST be a single JSON object that conforms to the following structure. Do NOT wrap it in markdown backticks or any other text.
    The 'location' and 'date' fields in the JSON MUST reflect the values you parsed from the user's query. The date should be in 'YYYY-MM-DD' format.

    {
      "location": "Paris, France",
      "date": "2024-10-27",
      "comfortScore": 10,
      "conditions": [
        {
          "name": "Very Hot",
          "likelihood": 85,
          "description": "Temperatures are expected to be significantly above the seasonal average.",
          "value": 35,
          "unit": "°C"
        }
      ],
      "summary": "Expect a very hot and uncomfortable day, with temperatures feeling even warmer due to high humidity.",
      "recommendations": [
        "Stay hydrated and seek air-conditioned spaces during peak hours.",
        "Consider swimming or other water-based activities to cool down."
      ]
    }

    - The "conditions" array must include all five categories: 'Very Hot', 'Very Cold', 'Very Windy', 'Very Wet', 'Very Uncomfortable'.
    - For 'Very Windy', 'Very Hot', or 'Very Cold', provide the predicted numerical 'value' and 'unit'. Otherwise, set value and unit to null.
    - Recommendations must be nuanced and actionable based on the specific conditions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const parsedJson = parseAndValidateJsonResponse(response.text, "Unable to find data for the specified location. Please check the name and try again.");
    
    const parsedData: PredictionData = parsedJson;
    
    if (parsedData.comfortScore == null || !Array.isArray(parsedData.conditions) || parsedData.conditions.length === 0 || !parsedData.location || !parsedData.date) {
      throw new Error("Invalid data structure received from AI.");
    }
    
    const sources = getUniqueSources(response);
    return { type: 'daily', data: { prediction: parsedData, sources } };

  } catch (error) {
    console.error("Error fetching or parsing weather prediction:", error);
    if (error instanceof Error && error.message.startsWith("Unable to find data")) {
        throw error;
    }
    throw new Error("Failed to communicate with the AI model or parse its response.");
  }
};


export const getCountryWeatherOverview = async (params: {country: string, month: number, year: number}): Promise<FullCountryOverviewResult> => {
    const { country, month, year } = params;
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });

    const prompt = `
      Analyze the typical weather comfort and climate for the entire country of "${country}" for the month of ${monthName}, ${year}.
      Use Google Search to find historical climate data, long-range forecasts, and regional weather patterns.

      If the provided country name does not correspond to a real, known country, you MUST return a single JSON object with a single key: {"isValidCountry": false}.

      If the country is valid, provide a comprehensive overview. Your final output must be a single JSON object conforming to the following structure. Do NOT wrap it in markdown backticks.

      {
        "country": "${country}",
        "month": ${month},
        "year": ${year},
        "overallSummary": "A high-level summary of the expected weather comfort across the country for the specified month and year.",
        "regionalBreakdowns": [
          {
            "region": "Northern Region",
            "summary": "Detailed summary for the northern part of the country, highlighting temperature ranges, precipitation, and unique conditions."
          },
          {
            "region": "Coastal Areas",
            "summary": "Summary for coastal areas, focusing on humidity, wind, and sea conditions."
          }
        ],
        "travelAdvice": [
          "Pack layered clothing for variable temperatures.",
          "Be prepared for potential afternoon showers in the south.",
          "Book accommodations with air conditioning in tropical zones."
        ]
      }
      
      - Provide at least 2-3 regional breakdowns for different parts of the country.
      - Travel advice should be practical and based on the climate analysis.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              tools: [{googleSearch: {}}],
            },
        });

        const parsedJson = parseAndValidateJsonResponse(response.text, "Unable to find data for the specified country. Please check the name and try again.");
        const overviewData: CountryOverviewData = parsedJson;

        if (!overviewData.country || !overviewData.overallSummary || !Array.isArray(overviewData.regionalBreakdowns)) {
            throw new Error("Invalid country overview data structure received from AI.");
        }

        const sources = getUniqueSources(response);
        return { type: 'country', data: { overview: overviewData, sources } };
    } catch (error) {
        console.error("Error fetching or parsing country overview:", error);
        if (error instanceof Error && error.message.startsWith("Unable to find data")) {
            throw error;
        }
        throw new Error("Failed to communicate with the AI model or parse its response for the country overview.");
    }
};