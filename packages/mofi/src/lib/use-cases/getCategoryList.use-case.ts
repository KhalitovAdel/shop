import { Axios } from 'axios';
import { JSDOM } from 'jsdom';

import { ParsingException } from '../exceptions';
import { ICategory } from '../interfaces';
import { IGetCategoryListCase } from '../mofi';

export class CategoryListException extends ParsingException {}

export class GetCategoryList implements IGetCategoryListCase {
    constructor(private readonly http: Axios) {}

    public async exec(): Promise<ICategory[]> {
        const response = await this.http.request<string>({
            method: 'GET',
            url: `catalog/zhenskaya-odezhda`,
        });

        const dom = new JSDOM(response.data, { url: this.http.defaults.baseURL });
        const doc = dom.window.document;

        const categoriesWrapperElement = doc.querySelector('div.category__main-subcategories');
        if (!categoriesWrapperElement)
            throw new CategoryListException('categoriesWrapperElement', categoriesWrapperElement);

        const categoriesElements = Array.from(
            categoriesWrapperElement.querySelectorAll(
                'ul.category__main-subcategories-list > li.category__main-subcategories-item'
            )
        );
        if (!categoriesElements.length) throw new CategoryListException('categoriesElements', categoriesElements);

        return categoriesElements.map((element) => {
            const linkElement = element.querySelector<HTMLAnchorElement>('a.preview-card--category');
            if (!linkElement) throw new CategoryListException('linkElement', linkElement);

            const nameElement = element.querySelector('h3.categories__item-related-title');
            if (!nameElement) throw new CategoryListException('nameElement', nameElement);

            const imgElement = element.querySelector<HTMLImageElement>('img.preview-card__img');
            if (!imgElement) throw new CategoryListException('imgElement', imgElement);

            return { url: new URL(linkElement.href), name: nameElement.innerHTML, image: new URL(imgElement.src) };
        });
    }
}
