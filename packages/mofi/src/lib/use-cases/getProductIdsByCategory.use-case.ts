import { Axios } from 'axios';
import { JSDOM } from 'jsdom';

import { ParsingException } from '../exceptions';
import { IGetProductIdsByCategoryCase } from '../mofi';

export class ProductIdsByCategoryException extends ParsingException {}

export class GetProductIdsByCategoryCase implements IGetProductIdsByCategoryCase {
    constructor(private readonly http: Axios) {}

    public async exec(url: URL): Promise<string[]> {
        const firstResult = await this.http.request({
            method: 'GET',
            url: url.href,
        });

        const dom = new JSDOM(firstResult.data, { url: this.http.defaults.baseURL });
        const doc = dom.window.document;

        const maxPageCount = GetProductIdsByCategoryCase.getMaxPageCount(doc);

        const result: string[][] = [];
        /**
         * JSDOM parse string html synchronously
         * So promise all make operation faster, but we must leave a margin for other requests.
         */
        for (const pageNumber of Array.from({ length: maxPageCount }, (_, i) => i + 1)) {
            const pageUrl = new URL(url);
            pageUrl.searchParams.append('page', `${pageNumber}`);

            const pageResult = await this.http.request({
                method: 'GET',
                url: pageUrl.href,
            });

            const pageDom = new JSDOM(pageResult.data, { url: this.http.defaults.baseURL });
            result.push(GetProductIdsByCategoryCase.getProductIds(pageDom.window.document));
        }

        return result.flat();
    }

    private static getMaxPageCount(doc: Document): number {
        const paginationElements = Array.from(doc.querySelectorAll('div.catalog--pagination div.pagination__item'));
        const lastPaginationElement = paginationElements.at(-1);
        if (!lastPaginationElement)
            throw new ProductIdsByCategoryException('lastPaginationElement', lastPaginationElement);

        const maxPageCountElement = lastPaginationElement.querySelector('span');
        if (!maxPageCountElement) throw new ProductIdsByCategoryException('maxPageCountElement', maxPageCountElement);

        const maxPage = +maxPageCountElement.innerHTML;
        if (isNaN(maxPage)) throw new ProductIdsByCategoryException('maxPage', maxPage);

        return maxPage;
    }

    private static getProductIds(doc: Document): string[] {
        const previewElements = Array.from(
            doc.querySelectorAll('div#list-products ul.products-main__list--more-products li.products-main__item')
        );

        return previewElements.map((element) => {
            const hrefElement = element.querySelector<HTMLAnchorElement>(
                'div.preview-card__img-container a.preview-card__slider-container'
            );
            if (!hrefElement) throw new ProductIdsByCategoryException('hrefElement', hrefElement);

            const id = hrefElement.href.split('/').at(-1);
            if (!id) throw new ProductIdsByCategoryException('id', id);

            return id;
        });
    }
}
