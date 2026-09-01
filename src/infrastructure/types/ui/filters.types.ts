
export interface TBaseFilterOptionConfig {
    value: string;
    label: string;
}

export interface TBaseFilterConfig {
    id: string;
    label: string;
}

export interface TTextFilterConfig extends TBaseFilterConfig {
    placeholder: string;
    type: 'text';
}

export interface TSelectFilterConfig extends TBaseFilterConfig {
    name: string;
    type: 'select';
}

export interface TDateFilterConfig extends TBaseFilterConfig {
    type: 'date';
    placeholder?: string;
}

export interface TNumberFilterConfig extends TBaseFilterConfig {
    type: 'number';
    placeholder?: string;
    min?: number;
    max?: number;
}

export type TFilterConfig = TTextFilterConfig | TSelectFilterConfig | TDateFilterConfig | TNumberFilterConfig;

export interface TBaseFormFiltersConfig {
    textFilters?: TTextFilterConfig[];
    selectFilters?: TSelectFilterConfig[];
    dateFilters?: TDateFilterConfig[];
    numberFilters?: TNumberFilterConfig[];
}

export type TBaseFilterOptionsConfig = Record<string, TBaseFilterOptionConfig[]>;
