export type CatalogOption = {
  id: string;
  label: string;
};

const CATEGORY_BASE: CatalogOption[] = [
  { id: "flagship", label: "Flagship" },
  { id: "foldables", label: "Foldable" },
  { id: "midrange", label: "Mid-range" },
  { id: "budget", label: "Budget" },
];

const BRAND_BASE: CatalogOption[] = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "pixel", label: "Pixel" },
  { id: "oneplus", label: "OnePlus" },
  { id: "xiaomi", label: "Xiaomi" },
  { id: "sony", label: "Sony" },
  { id: "honor", label: "Honor" },
];

export const CATEGORY_OPTIONS: CatalogOption[] = CATEGORY_BASE;
export const BRAND_OPTIONS: CatalogOption[] = BRAND_BASE;

const prependAll = (label: string): CatalogOption => ({ id: "all", label });

export const CATEGORY_FILTER_OPTIONS: CatalogOption[] = [prependAll("All"), ...CATEGORY_OPTIONS];
export const BRAND_FILTER_OPTIONS: CatalogOption[] = [prependAll("All"), ...BRAND_OPTIONS];

export const BRAND_PRESET_LABELS = BRAND_OPTIONS.map((option) => option.label);
