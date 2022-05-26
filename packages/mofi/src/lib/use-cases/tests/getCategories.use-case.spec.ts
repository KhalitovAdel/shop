import { Axios } from 'axios';

import { GetCategoryList } from '../getCategoryList.use-case';

describe('GetCategories', () => {
    const axios = new Axios({ baseURL: 'https://mofi.ru' });
    const instance = new GetCategoryList(axios);

    it('plain test', async () => {
        const result = await instance.exec();

        expect(result.length).toBeGreaterThan(1);
        result.map((el) =>
            expect(el).toMatchObject({
                image: expect.any(URL),
                name: expect.any(String),
                url: expect.any(URL),
            })
        );
    });
});
