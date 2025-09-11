// Swiss address autocomplete service using OpenPLZ API
// Documentation: https://www.openplzapi.org/en/switzerland/

export interface SwissLocation {
  postalCode: string;
  name: string;
  state: string; // Canton
  district?: string;
  locality?: string;
}

export interface SwissStreet {
  name: string;
  postalCode: string;
  locality: string;
  state: string;
  district?: string;
}

export interface AddressSuggestion {
  fullAddress: string;
  street?: string;
  postalCode: string;
  city: string;
  state: string;
  type: 'locality' | 'street';
}

class SwissAddressService {
  private readonly baseUrl = 'https://openplzapi.org';
  
  /**
   * Search for localities (cities/towns) by postal code or name
   */
  async searchLocalities(query: string): Promise<SwissLocation[]> {
    try {
      // Clean the query
      const cleanQuery = query.trim();
      if (cleanQuery.length < 2) return [];
      
      // Check if query is numeric (postal code search)
      const isPostalCode = /^\d{1,4}$/.test(cleanQuery);
      
      let url: string;
      if (isPostalCode) {
        // Search by postal code
        url = `${this.baseUrl}/ch/Localities?postalCode=${cleanQuery}`;
      } else {
        // Search by name
        url = `${this.baseUrl}/ch/Localities?name=${encodeURIComponent(cleanQuery)}`;
      }
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add mode to handle CORS if needed
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error searching Swiss localities:', error);
      
      // Fallback: return some common Swiss cities for development
      if (query.length >= 2) {
        return this.getFallbackLocalities(query);
      }
      return [];
    }
  }
  
  /**
   * Search for streets in a specific locality
   */
  async searchStreets(locality: string, postalCode: string, streetQuery?: string): Promise<SwissStreet[]> {
    try {
      if (!locality || !postalCode) return [];
      
      let url = `${this.baseUrl}/ch/Streets?locality=${encodeURIComponent(locality)}&postalCode=${postalCode}`;
      
      if (streetQuery && streetQuery.trim().length > 0) {
        url += `&street=${encodeURIComponent(streetQuery.trim())}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error searching Swiss streets:', error);
      return [];
    }
  }
  
  /**
   * Search for streets globally by name
   */
  async searchStreetsByName(streetQuery: string): Promise<SwissStreet[]> {
    try {
      if (!streetQuery || streetQuery.trim().length < 2) return [];
      
      const url = `${this.baseUrl}/ch/Streets?name=${encodeURIComponent(streetQuery.trim())}`;
      
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error searching streets by name:', error);
      return [];
    }
  }

  /**
   * Get address suggestions based on user input
   * This combines locality and street search for better UX
   */
  async getAddressSuggestions(query: string, _currentAddress?: {
    postalCode?: string;
    city?: string;
  }): Promise<AddressSuggestion[]> {
    const suggestions: AddressSuggestion[] = [];
    
    try {
      // Search for streets by name globally (street-first approach)
      const streets = await this.searchStreetsByName(query);
      
      streets.slice(0, 8).forEach(street => {
        suggestions.push({
          fullAddress: `${street.name}, ${street.postalCode} ${street.locality}`,
          street: street.name,
          postalCode: street.postalCode,
          city: street.locality,
          state: street.state,
          type: 'street'
        });
      });
      
      // Also search for localities (cities/postal codes)
      const localities = await this.searchLocalities(query);
      
      localities.slice(0, 5).forEach(location => {
        // Avoid duplicates if we already have this city from street search
        const exists = suggestions.some(s => 
          s.postalCode === location.postalCode && s.city === location.name
        );
        
        if (!exists) {
          suggestions.push({
            fullAddress: `${location.postalCode} ${location.name}`,
            postalCode: location.postalCode,
            city: location.name,
            state: location.state,
            type: 'locality'
          });
        }
      });
      
    } catch (error) {
      console.error('Error getting address suggestions:', error);
    }
    
    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }
  
  /**
   * Validate Swiss postal code format
   */
  isValidSwissPostalCode(postalCode: string): boolean {
    return /^\d{4}$/.test(postalCode.trim());
  }
  
  /**
   * Fallback localities for when API is not available
   */
  private getFallbackLocalities(query: string): SwissLocation[] {
    const fallbackData: SwissLocation[] = [
      { postalCode: '8001', name: 'Zürich', state: 'Zürich' },
      { postalCode: '8002', name: 'Zürich', state: 'Zürich' },
      { postalCode: '8003', name: 'Zürich', state: 'Zürich' },
      { postalCode: '8004', name: 'Zürich', state: 'Zürich' },
      { postalCode: '8005', name: 'Zürich', state: 'Zürich' },
      { postalCode: '3001', name: 'Bern', state: 'Bern' },
      { postalCode: '3002', name: 'Bern', state: 'Bern' },
      { postalCode: '3003', name: 'Bern', state: 'Bern' },
      { postalCode: '4001', name: 'Basel', state: 'Basel-Stadt' },
      { postalCode: '4002', name: 'Basel', state: 'Basel-Stadt' },
      { postalCode: '4003', name: 'Basel', state: 'Basel-Stadt' },
      { postalCode: '1201', name: 'Genève', state: 'Genève' },
      { postalCode: '1202', name: 'Genève', state: 'Genève' },
      { postalCode: '1203', name: 'Genève', state: 'Genève' },
      { postalCode: '1000', name: 'Lausanne', state: 'Vaud' },
      { postalCode: '1001', name: 'Lausanne', state: 'Vaud' },
      { postalCode: '1002', name: 'Lausanne', state: 'Vaud' },
      { postalCode: '6900', name: 'Lugano', state: 'Ticino' },
      { postalCode: '9000', name: 'St. Gallen', state: 'St. Gallen' },
      { postalCode: '7000', name: 'Chur', state: 'Graubünden' },
      { postalCode: '6000', name: 'Luzern', state: 'Luzern' },
      { postalCode: '2000', name: 'Neuchâtel', state: 'Neuchâtel' },
      { postalCode: '5000', name: 'Aarau', state: 'Aargau' },
    ];

    const lowerQuery = query.toLowerCase();
    
    return fallbackData.filter(location => 
      location.postalCode.startsWith(query) || 
      location.name.toLowerCase().includes(lowerQuery) ||
      location.state.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);
  }

  /**
   * Format Swiss address for display
   */
  formatSwissAddress(street: string, houseNumber: string, postalCode: string, city: string): string {
    const parts = [];
    if (street && houseNumber) {
      parts.push(`${street} ${houseNumber}`);
    } else if (street) {
      parts.push(street);
    }
    if (postalCode && city) {
      parts.push(`${postalCode} ${city}`);
    }
    return parts.join(', ');
  }
}

export const swissAddressService = new SwissAddressService();