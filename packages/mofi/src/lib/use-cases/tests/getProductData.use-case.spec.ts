import { Axios } from 'axios';

import { IBaseProduct } from '../../interfaces';
import { defaultProductPage, saleProductPage } from '../__mocks__/getProductData.seed';
import { GetProductData } from '../getProductData.use-case';

describe('GetProductData', () => {
    const axios = new Axios({ baseURL: 'https://mofi.ru' });
    const instance = new GetProductData(axios);
    const spy = jest.spyOn(axios, 'request');

    function expectBaseProduct(value: IBaseProduct<boolean>) {
        expect(value).toMatchObject({
            characters: expect.any(Array),
            colorIds: expect.any(Array),
            description: expect.any(String),
            images: expect.any(Array),
            offerIds: expect.any(Array),
            price: expect.any(Number),
            sizes: expect.any(Array),
            sku: expect.any(String),
            title: expect.any(String),
        });
    }

    afterAll(jest.restoreAllMocks);

    it.each([
        ['default', defaultProductPage],
        ['sale', saleProductPage],
    ])('test %s product page', async (_, data) => {
        spy.mockImplementation(async () => ({ data }));

        const result = await instance.exec('');

        if (!result.isOnSale) return expectBaseProduct(result);
        const { salePrice, ...other } = result;
        expect(typeof salePrice === 'number').toBeTruthy();

        return expectBaseProduct(other);
    });
});
