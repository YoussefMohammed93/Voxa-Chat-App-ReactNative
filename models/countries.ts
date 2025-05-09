export interface Country {
  code: string;
  name: string;
  flag?: string;
  dialCode: string;
}

export const countries: Country[] = [
  { code: "EG", name: "Egypt", dialCode: "+20" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
];

export const defaultCountry =
  countries.find((country) => country.code === "EG") || countries[0];

export const findCountryByCode = (code: string): Country | undefined => {
  return countries.find((country) => country.code === code);
};

export const findCountryByDialCode = (
  dialCode: string
): Country | undefined => {
  return countries.find((country) => country.dialCode === dialCode);
};
