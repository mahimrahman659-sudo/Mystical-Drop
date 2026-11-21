export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export const INITIAL_PRODUCT_FORM_STATE: ProductFormState = {};
