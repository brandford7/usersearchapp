export interface Person {
  id: string; // Changed from number to string based on "2547913228"
  firstname: string;
  middlename: string;
  lastname: string;
  dob: string;
  address: string;
  city: string;
  st: string; // Note: Your API uses 'st', not 'state'
  zip: string;
  ssn: string;
  phone: string;
}

//Defines the structure of your API response
export interface ApiResponse {
  data: Person[];
  // null on cursor-paginated pages after the first, unless includeTotal is sent —
  // cache the value from the first page instead of expecting it on every response.
  totalPages: number | null;
  total: number | null;
  // true when `total` hit the backend's count cap — the real total is at
  // least this many, possibly far more. Render `total` as "N+" when true.
  totalCapped: boolean;
  limit: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  hasPrevious: boolean;
}

export interface SearchFilters {
  firstName: string;
  middleName: string;
  lastName: string;
  zip: string;
  city: string;
  state: string;
  dob: string;
  email: string;
  phone: string;
  ssn: string;
}
