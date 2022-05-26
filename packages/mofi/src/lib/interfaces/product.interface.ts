export interface IBaseProduct<IS_ON_SALE extends boolean = false> {
    sku: string;
    title: string;
    description?: string;
    price: number;
    images: URL[];
    characters: { name: string; value: string }[];
    sizes: { size: string; count: number }[];
    colorIds: string[];
    offerIds: string[];
    isOnSale: IS_ON_SALE;
}

export interface ISaleProduct extends IBaseProduct<true> {
    salePrice: number;
}

export type IProduct = IBaseProduct | ISaleProduct;
