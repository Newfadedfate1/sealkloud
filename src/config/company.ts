export interface CompanyConfig {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  supportEmail: string;
  supportPhone?: string;
  theme: {
    loginBackground: string;
    cardShadow: string;
  };
}

export const defaultCompanyConfig: CompanyConfig = {
  name: "SealKloud",
  primaryColor: "#0ea5e9",
  secondaryColor: "#0284c7",
  accentColor: "#f59e0b",
  supportEmail: "support@sealkloud.com",
  supportPhone: "+1 (555) 123-4567",
  theme: {
    loginBackground: "from-sky-50 to-blue-100",
    cardShadow: "shadow-xl",
  },
};

// This can be easily swapped for different companies
export const companyConfig = defaultCompanyConfig;