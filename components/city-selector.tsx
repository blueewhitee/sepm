"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { City } from "@/lib/city-utils"
import CitySearch from "@/components/city-search"

export default function CitySelector() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const router = useRouter()

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    
    // Navigate to the selected city's events page
    // Using the city ID as the identifier for consistency with API
    if (city) {
      router.push(`/forums/events?city=${city.id}`)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-2 text-sm font-medium">Explore city-specific information</div>
      <CitySearch 
        onCitySelect={handleCitySelect}
        placeholder="Search for a city..."
      />
    </div>
  )
}
