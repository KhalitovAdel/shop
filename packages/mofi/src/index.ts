import { Axios } from 'axios';

import { MofiClient } from './lib/mofi';
import {
    GetProductData,
    GetProductIdsByCategoryCase,
    ILogErrorLogger,
    ILogResultLogger,
    Logger,
} from './lib/use-cases';
import { GetCategoryList } from './lib/use-cases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ILogger extends ILogResultLogger<any>, ILogErrorLogger {
    child(opts: { label: string }): ILogger;
}

export function createMofiClient(logger?: ILogger, axios: Axios = new Axios()) {
    axios.defaults.baseURL = 'https://mofi.ru';

    const productDataCase = new GetProductData(axios);
    const pdcLogger = logger ? logger.child({ label: GetProductData.name }) : undefined;

    const categoryListCase = new GetCategoryList(axios);
    const clLogger = logger ? logger.child({ label: GetCategoryList.name }) : undefined;

    const productIdsByCategoryCase = new GetProductIdsByCategoryCase(axios);
    const pibcLogger = logger ? logger.child({ label: GetProductIdsByCategoryCase.name }) : undefined;

    return new MofiClient(
        pdcLogger ? new Logger(pdcLogger, pdcLogger, productDataCase) : productDataCase,
        clLogger ? new Logger(clLogger, clLogger, categoryListCase) : categoryListCase,
        pibcLogger ? new Logger(pibcLogger, pibcLogger, productIdsByCategoryCase) : productIdsByCategoryCase
    );
}

export { MofiClient } from './lib/mofi';

export * from './lib/exceptions';

export { ProductDataException, CategoryListException, ProductIdsByCategoryException } from './lib/use-cases';

export * from './lib/interfaces';
