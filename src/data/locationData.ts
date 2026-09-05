export interface CityLocationData {
  city: string;
  country: string;
  province_state?: string;
  areas: string[];
  default_code_prefix: string;
}

export const DEFAULT_CITIES_DATA: CityLocationData[] = [
  {
    city: 'Islamabad',
    country: 'Pakistan',
    province_state: 'Federal Capital',
    default_code_prefix: 'ISB',
    areas: [
      'Blue Area',
      'F-6 Super Market',
      'F-7 Jinnah Super',
      'F-8 Markaz',
      'F-10 Markaz',
      'F-11 Markaz',
      'G-8 Markaz',
      'G-9 Karachi Company',
      'G-10 Markaz',
      'G-11 Markaz',
      'I-8 Markaz',
      'E-11 MPCHS',
      'DHA Phase 2',
      'Bahria Town Phase 1-6',
      'Bahria Town Phase 7-8',
      'PWD Housing Society',
      'Gulberg Greens',
      'Soan Gardens',
      'H-12 (NUST Metro Station)',
      'Park Road / Chak Shahzad',
    ],
  },
  {
    city: 'Lahore',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'LHR',
    areas: [
      'Gulberg III (Main Boulevard)',
      'Gulberg II (MM Alam Road)',
      'DHA Phase 1',
      'DHA Phase 2',
      'DHA Phase 3 (Y-Block)',
      'DHA Phase 5 (Commercial Broadway)',
      'DHA Phase 6',
      'Model Town (Link Road)',
      'Johar Town (G1 / PIA Main Blvd)',
      'Faisal Town',
      'Garden Town (Barkat Market)',
      'Cavalry Ground',
      'Mall Road / Queens Road',
      'Jail Road / Shadman',
      'Allama Iqbal Town',
      'Bahria Town (Safari Mall)',
      'Wapda Town Roundabout',
      'Lake City Commercial',
      'Thokar Niaz Baig',
    ],
  },
  {
    city: 'Karachi',
    country: 'Pakistan',
    province_state: 'Sindh',
    default_code_prefix: 'KHI',
    areas: [
      'Clifton (Block 2 / Bilawal Chowrangi)',
      'Clifton (Block 5 / Boat Basin)',
      'Clifton (Block 9 / Schon Circle)',
      'DHA Phase 2 (Sunset Comm.)',
      'DHA Phase 5 (Khayaban-e-Shahbaz)',
      'DHA Phase 6 (Bukhari Commercial)',
      'Shahrah-e-Faisal (PECHS)',
      'Tariq Road (Commercial)',
      'Bahadurabad (Char Minar)',
      'Gulshan-e-Iqbal (Block 13-A)',
      'Gulshan-e-Iqbal (University Road)',
      'North Nazimabad (Hyderi)',
      'Saddar (Preedy Street)',
      'Gulistan-e-Johar (Block 14)',
      'Malir Cantt Commercial',
      'Federal B Area (Water Pump)',
      'KDA Scheme 1 (Karsaz)',
    ],
  },
  {
    city: 'Rawalpindi',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'RWP',
    areas: [
      'Saddar (Bank Road / The Mall)',
      'Commercial Market (Satellite Town)',
      'Chaklala Scheme 3',
      'Bahria Town Phase 4 (Civic Center)',
      'Bahria Town Phase 7 (Spring North)',
      'Peshawar Road (Chur Chowk)',
      'Westridge 1',
      'DHA Phase 1 (Orchard)',
      'Airport Housing Society',
      'Askari 14',
      'Murree Road (Chandni Chowk)',
    ],
  },
  {
    city: 'Peshawar',
    country: 'Pakistan',
    province_state: 'Khyber Pakhtunkhwa',
    default_code_prefix: 'PEW',
    areas: [
      'University Road (Jamrud Road)',
      'Hayatabad Phase 3 (Commercial)',
      'Hayatabad Phase 5',
      'Saddar / Cantt (The Mall)',
      'Warsak Road',
      'Dabgari Gardens',
      'Ring Road Chowk',
      'Gulbahar Scheme',
      'Deans Trade Center',
    ],
  },
  {
    city: 'Faisalabad',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'FSD',
    areas: [
      'D-Ground (Peoples Colony No. 1)',
      'Kohinoor City (Jaranwala Road)',
      'Canal Road (East Canal)',
      'Satyana Road',
      'Susan Road (Madina Town)',
      'Civil Lines',
      'Kotwali Road / Clock Tower',
      'Millat Road',
      'Samundri Road',
    ],
  },
  {
    city: 'Multan',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'MUX',
    areas: [
      'Bosan Road (Chowk Commercial)',
      'Gulgasht Colony (Gol Bagh)',
      'Abdali Road (Cantt)',
      'Shah Rukn-e-Alam Colony',
      'Officers Colony',
      'Model Town Commercial',
      'Multan Bypass (Nawan Shehr)',
      'MDA Chowk',
    ],
  },
  {
    city: 'Sialkot',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'SKT',
    areas: [
      'Paris Road (Main Chamber Hub)',
      'Defense Road (Cantt Commercial)',
      'Kashmir Road',
      'Sambrial Road',
      'Sialkot Bypass',
      'Model Town',
      'Commissioner Road',
      'Kutchery Road',
    ],
  },
  {
    city: 'Gujranwala',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'GRW',
    areas: [
      'Model Town (Main Boulevard)',
      'DC Colony',
      'Rahwali Cantt',
      'Peoples Colony',
      'GT Road Commercial',
      'Satellite Town (Market)',
      'Wapda Town',
      'Master City',
    ],
  },
  {
    city: 'Abbottabad',
    country: 'Pakistan',
    province_state: 'Khyber Pakhtunkhwa',
    default_code_prefix: 'ATD',
    areas: [
      'Supply (Mansehra Road)',
      'Mandian (Kaghan Colony)',
      'The Mall / Cantt',
      'PMA Road',
      'Jinnahabad Commercial',
      'Kakul Road',
      'Murree Road Bypass',
    ],
  },
  {
    city: 'Gujrat',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'GJT',
    areas: [
      'Bhimber Road',
      'Court Road',
      'GT Road Commercial',
      'Shadman Town',
      'Rehman Shaheed Road',
      'Jalalpur Jattan Road',
    ],
  },
  {
    city: 'Sargodha',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'SGD',
    areas: [
      'Satellite Town Commercial',
      'University Road',
      'Club Road',
      'Fatima Jinnah Road',
      'PAF Road',
      'Cantt Market',
    ],
  },
  {
    city: 'Bahawalpur',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'BHV',
    areas: [
      'Model Town A',
      'Model Town B',
      'University Road',
      'Baghdad Road',
      'Dubai Mahal Road',
      'Circular Road',
    ],
  },
  {
    city: 'Quetta',
    country: 'Pakistan',
    province_state: 'Balochistan',
    default_code_prefix: 'UET',
    areas: [
      'Jinnah Road (Main Commercial)',
      'Zarghoon Road',
      'Cantt Commercial',
      'Samungli Road',
      'Model Town',
      'Satellite Town',
      'Airport Road',
    ],
  },
  {
    city: 'Hyderabad',
    country: 'Pakistan',
    province_state: 'Sindh',
    default_code_prefix: 'HDD',
    areas: [
      'Autobahn Road (Latifabad Unit 2)',
      'Latifabad Unit 7',
      'Saddar Cantt',
      'Qasimabad (Wadhu Wah Road)',
      'Citizen Colony',
      'Defence Commercial',
    ],
  },
  {
    city: 'Mirpur (AJK)',
    country: 'Pakistan',
    province_state: 'Azad Kashmir',
    default_code_prefix: 'MPR',
    areas: [
      'Allama Iqbal Road',
      'Sector F-1 Commercial',
      'Sector F-2 Commercial',
      'Sector C-3 Commercial',
      'New City Commercial',
      'Chowk Shaheedan',
    ],
  },
  {
    city: 'Mardan',
    country: 'Pakistan',
    province_state: 'Khyber Pakhtunkhwa',
    default_code_prefix: 'MDN',
    areas: [
      'Mall Road (Cantt)',
      'Nowshera Road',
      'Sheikh Maltoon Town (Sector A)',
      'Baghdada Chowk',
      'Bank Road',
    ],
  },
  {
    city: 'Wah Cantt / Taxila',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'WAH',
    areas: [
      'The Mall (Aslam Market)',
      'Officers Colony',
      'GT Road Commercial',
      'Taxila Museum Road',
      'Lala Rukh Commercial',
    ],
  },
  {
    city: 'Jehlum',
    country: 'Pakistan',
    province_state: 'Punjab',
    default_code_prefix: 'JHL',
    areas: [
      'Cantt Market',
      'Kazim Kamal Road',
      'GT Road Commercial',
      'Machine Mohalla',
      'Bilal Town',
    ],
  },
  {
    city: 'Sukkur',
    country: 'Pakistan',
    province_state: 'Sindh',
    default_code_prefix: 'SKR',
    areas: [
      'Military Road',
      'Minara Road',
      'Barrage Road',
      'Cooperative Housing Society',
    ],
  },
  // International Hubs
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    province_state: 'Dubai',
    default_code_prefix: 'DXB',
    areas: [
      'Business Bay (Prime Tower)',
      'Downtown Dubai (Emaar Square)',
      'Sheikh Zayed Road',
      'Deira (Port Saeed / Clock Tower)',
      'Bur Dubai (Al Mankhool)',
      'Al Barsha 1',
      'Jumeirah Lakes Towers (JLT Cluster M)',
      'Dubai Silicon Oasis',
      'Al Karama',
      'Al Garhoud',
    ],
  },
  {
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    province_state: 'Abu Dhabi',
    default_code_prefix: 'AUH',
    areas: [
      'Hamdan Street (Al Danah)',
      'Corniche Road',
      'Al Reem Island',
      'Al Khalidiya',
      'Mussafah Commercial',
    ],
  },
  {
    city: 'Sharjah',
    country: 'United Arab Emirates',
    province_state: 'Sharjah',
    default_code_prefix: 'SHJ',
    areas: [
      'Al Majaz 2 (Corniche)',
      'Al Nahda (Sahara Mall area)',
      'Al Taawun',
      'Rolla Commercial',
      'Al Qasimia',
    ],
  },
  {
    city: 'Riyadh',
    country: 'Saudi Arabia',
    province_state: 'Riyadh',
    default_code_prefix: 'RUH',
    areas: [
      'Olaya Commercial District',
      'Al Sulaimaniyah',
      'King Fahd Road',
      'Al Nakheel',
      'Al Malaz',
    ],
  },
  {
    city: 'Jeddah',
    country: 'Saudi Arabia',
    province_state: 'Makkah',
    default_code_prefix: 'JED',
    areas: [
      'Al Andalus (Tahlia Street)',
      'Al Rawdah',
      'Palestine Street',
      'Al Zahra',
      'King Abdulaziz Road',
    ],
  },
  {
    city: 'Doha',
    country: 'Qatar',
    province_state: 'Doha',
    default_code_prefix: 'DOH',
    areas: [
      'West Bay Financial Area',
      'Al Sadd Commercial',
      'Old Airport Road',
      'The Pearl-Qatar',
    ],
  },
  {
    city: 'London',
    country: 'United Kingdom',
    province_state: 'Greater London',
    default_code_prefix: 'LON',
    areas: [
      'Central London (Oxford St)',
      'Canary Wharf (Financial Center)',
      'Whitechapel',
      'Ilford (Cranbrook Road)',
      'Harrow',
      'Croydon',
    ],
  },
];

/**
 * Get all available default cities
 */
export function getCityList(): string[] {
  return DEFAULT_CITIES_DATA.map((c) => c.city);
}

/**
 * Get City Location entry for a given city name
 */
export function getCityData(cityName: string): CityLocationData | undefined {
  return DEFAULT_CITIES_DATA.find(
    (c) => c.city.toLowerCase() === cityName.trim().toLowerCase()
  );
}

/**
 * Get the list of areas for a given city
 */
export function getAreasForCity(cityName: string): string[] {
  const data = getCityData(cityName);
  return data ? data.areas : [];
}

/**
 * Get country for city
 */
export function getCountryForCity(cityName: string): string {
  const data = getCityData(cityName);
  return data ? data.country : 'Pakistan';
}

/**
 * Helper to generate a franchise code suggestion based on city and area
 */
export function generateFranchiseCodeSuggestion(cityName: string, areaName?: string): string {
  const data = getCityData(cityName);
  const prefix = data ? data.default_code_prefix : cityName.slice(0, 3).toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  if (areaName && areaName !== 'Other / Custom Area') {
    // Generate clean acronym from area if possible
    const areaAcronym = areaName
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 3)
      .join('');
    return `SWC-${prefix}-${areaAcronym || 'BR'}-${num}`;
  }
  return `SWC-${prefix}-${num}`;
}
