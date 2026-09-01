
export interface TBaseCardConfig {
    title: string,
}

export interface TBaseListCardConfig extends TBaseCardConfig {
   detailsPath: string;
   showOpenSelectedButton: boolean;
}
