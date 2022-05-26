import { ICategory, IProduct } from './interfaces';
import { AbstractUseCase } from './use-cases';

export type IGetProductDataCase = AbstractUseCase<[string], IProduct>;
export type IGetCategoryListCase = AbstractUseCase<[], ICategory[]>;
export type IGetProductIdsByCategoryCase = AbstractUseCase<[URL], string[]>;

export class MofiClient {
    constructor(
        private readonly getProductUseCase: IGetProductDataCase,
        private readonly getCategoryListCase: IGetCategoryListCase,
        private readonly getProductIdsByCategoryCase: IGetProductIdsByCategoryCase
    ) {}

    public getProductData(productId: string): Promise<IProduct> {
        return this.getProductUseCase.exec(productId);
    }

    public getCategoryList(): Promise<ICategory[]> {
        return this.getCategoryListCase.exec();
    }

    public getProductIdsByCategory(url: URL): Promise<string[]> {
        return this.getProductIdsByCategoryCase.exec(url);
    }
}
