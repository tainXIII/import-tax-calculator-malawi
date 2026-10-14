export interface ProductTaxCategory {
  id: string;
  name: string;
  hsCode?: string;
  importDuty: number; // %
  exciseTax: number;  // %
  vat: number;        // %
  surcharge: number;  // %
}

// Default values based on standard rates
const DEFAULT_IMPORT_DUTY = 30;
const DEFAULT_EXCISE = 0;
const DEFAULT_VAT = 16.5;

export const productCategories: ProductTaxCategory[] = [
  { id: "gen", name: "General / Other Goods", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 0 },
  { id: "poultry", name: "Dressed Poultry", hsCode: "02.07", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 30 },
  { id: "fish", name: "Fish", hsCode: "03.02-03.05", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 10 },
  { id: "milk", name: "Milk", hsCode: "04.01", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "yoghurt", name: "Yoghurt", hsCode: "0403.20.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "eggs", name: "Eggs", hsCode: "04.07", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 30 },
  { id: "honey", name: "Natural Honey", hsCode: "0409.00.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "vegetables", name: "Vegetables", hsCode: "07", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 40 },
  { id: "fruits", name: "Fruits", hsCode: "08", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "pepper", name: "Pepper", hsCode: "0904", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "maize", name: "Maize seed", hsCode: "1005.10.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 25 },
  { id: "wheat", name: "Wheat flour", hsCode: "1101.00.10", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 5 },
  { id: "oil", name: "Refined oils", hsCode: "15", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 10 },
  { id: "sugar", name: "Cane sugar", hsCode: "1701", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "art_honey", name: "Artificial Honey", hsCode: "1702.90.90", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "sweets", name: "Sweets", hsCode: "1704.90.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "biscuits", name: "Biscuits", hsCode: "1905.31.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "crisps", name: "Crisps", hsCode: "2005.20.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "chilli", name: "Chilli Sauce", hsCode: "2103.90.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "alc", name: "Alcoholic beverages", hsCode: "22", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "non_alc", name: "Non-alcoholic beverages", hsCode: "22", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "cement", name: "Portland Cement", hsCode: "2523", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 30 },
  { id: "matches", name: "Matches", hsCode: "3605.00.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 25 },
  { id: "plastics", name: "Household plastics (Tableware/Kitchenware)", hsCode: "3924", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "poles", name: "Treated poles", hsCode: "44.03", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 25 },
  { id: "toothpicks", name: "Toothpicks", hsCode: "44.19", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 40 },
  { id: "cartons", name: "Monocartons", hsCode: "4819.20.30", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "bags_cement", name: "Bags for packing cement", hsCode: "4819.40.10", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "books", name: "Exercise books (soft cover)", hsCode: "4820.20.10", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 10 },
  { id: "textbooks", name: "Textbooks", hsCode: "4901.99.10", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 10 },
  { id: "blankets", name: "Blankets", hsCode: "63.01", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 25 },
  { id: "poly_bags", name: "Polypropylene woven bags", hsCode: "6305.33", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "alum_pots", name: "Aluminum pots", hsCode: "7615.10.30", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "plastic_furn", name: "Plastic Furniture", hsCode: "9403.70.90", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 20 },
  { id: "pens", name: "Ball point pens", hsCode: "9608.10.00", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 15 },
  { id: "diapers", name: "Diapers", hsCode: "9619.00.90", importDuty: DEFAULT_IMPORT_DUTY, exciseTax: DEFAULT_EXCISE, vat: DEFAULT_VAT, surcharge: 25 }
];
