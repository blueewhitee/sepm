import { cache } from 'react'
import axios from 'axios'

// Define the type for a city object based on the Geoapify API response
export interface City {
  id: string
  name: string
  latitude?: number
  longitude?: number
  country?: string
  countryCode?: string
  state?: string
  county?: string
  formatted?: string
}

// Hardcoded cities as fallback
export const hardcodedCities: Record<string, string> = {
  nyc: "New York City",
  tokyo: "Tokyo",
  paris: "Paris",
  bangkok: "Bangkok",
  chennai: "Chennai",
}

// Cached version of getCities to prevent multiple API calls
export const getCities = cache(async (): Promise<City[]> => {
  try {
    const response = await axios.get(
      'https://api.geoapify.com/v1/geocode/autocomplete',
      {
        params: {
          text: 'city',
          type: 'city',
          limit: 10,
          apiKey: '12b0ca69ac4448c39b91ebc8db7b8d50'
        }
      }
    )

    if (response.status !== 200) {
      console.error("Failed to fetch cities:", response.status, response.statusText)
      return []
    }

    // Transform the Geoapify response to match our City interface
    return response.data.features.map((feature: any) => ({
      id: feature.properties.place_id || String(Math.random()),
      name: feature.properties.city || feature.properties.name,
      latitude: feature.properties.lat,
      longitude: feature.properties.lon,
      country: feature.properties.country,
      countryCode: feature.properties.country_code,
      state: feature.properties.state,
      formatted: feature.properties.formatted
    }))
  } catch (error) {
    console.error("Error fetching cities:", error)
    return []
  }
})

// Function to get city label from code
export const getCityLabel = (cityCode: string, cities: City[] = []) => {
  // Try to find the city by ID in the API results
  const city = cities.find((c) => c.id === cityCode)
  if (city) return city.name

  // Fallback to hardcoded values if not found in API results
  return hardcodedCities[cityCode as keyof typeof hardcodedCities] || cityCode
}

// Function to search cities by name - using Geoapify autocomplete API
export async function searchCitiesByName(query: string): Promise<City[]> {
  if (!query || query.length < 2) return []

  try {
    const response = await axios.get(
      'https://api.geoapify.com/v1/geocode/autocomplete',
      {
        params: {
          text: query,
          type: 'city',
          limit: 5,
          apiKey: '12b0ca69ac4448c39b91ebc8db7b8d50'
        }
      }
    )

    if (response.status !== 200) {
      console.error("Failed to search cities:", response.status, response.statusText)
      return []
    }

    // Transform the Geoapify response to match our City interface
    return response.data.features.map((feature: any) => ({
      id: feature.properties.place_id || String(Math.random()),
      name: feature.properties.city || feature.properties.name,
      latitude: feature.properties.lat,
      longitude: feature.properties.lon,
      country: feature.properties.country,
      countryCode: feature.properties.country_code,
      state: feature.properties.state,
      formatted: feature.properties.formatted
    }))
  } catch (error) {
    console.error("Error searching cities:", error)
    return []
  }
}