import { Axios } from 'axios';

import { GetProductIdsByCategoryCase } from '../getProductIdsByCategory.use-case';

describe('GetProductIdsByCategoryCase', () => {
    jest.setTimeout(1000 * 60 * 1);
    const axios = new Axios({ baseURL: 'https://mofi.ru' });
    const instance = new GetProductIdsByCategoryCase(axios);

    it('plain test', async () => {
        const result = await instance.exec(new URL('https://mofi.ru/catalog/zhenskaya-odezhda/dzhinsy'));

        expect(result.length).toBeGreaterThan(1);
        result.forEach((el) => expect(typeof el === 'string').toBeTruthy());
    });
});
