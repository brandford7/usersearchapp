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
}
