'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, Search, MapPin } from 'lucide-react'
import { City, searchCitiesByName } from '@/lib/city-utils'

interface CitySearchProps {
  onCitySelect: (city: City) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function CitySearch({ 
  onCitySelect, 
  placeholder = "Search for a city...",
  initialValue = ""
}: CitySearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchCities = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }
      
      setIsLoading(true)
      try {
        const cities = await searchCitiesByName(query)
        setResults(cities)
        setShowResults(true)
      } catch (error) {
        console.error('Error searching cities:', error)
      } finally {
        setIsLoading(false)
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(fetchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Format the display string for each city result
  const formatCityDisplay = (city: City): string => {
    if (city.formatted) return city.formatted;
    
    const parts = [];
    if (city.name) parts.push(city.name);
    if (city.state) parts.push(city.state);
    if (city.country) parts.push(city.country);
    
    return parts.join(', ');
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10"
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-md">
          <ul className="max-h-60 overflow-auto py-1">
            {results.map((city) => (
              <li 
                key={city.id}
                className="cursor-pointer px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onCitySelect(city);
                  setQuery(formatCityDisplay(city));
                  setShowResults(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{city.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {city.state && `${city.state}, `}{city.country}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}