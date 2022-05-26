import { Axios } from 'axios';
import { JSDOM } from 'jsdom';

import { ParsingException } from '../exceptions';
import { IBaseProduct, IProduct, ISaleProduct } from '../interfaces';
import { IGetProductDataCase } from '../mofi';

export class ProductDataException extends ParsingException {
    public static throw(...args: ConstructorParameters<typeof ProductDataException>): never {
        throw new ProductDataException(...args);
    }
}

type UnpackArray<T> = T extends (infer U)[] ? U : T;

export class GetProductData implements IGetProductDataCase {
    constructor(private readonly http: Axios) {}

    public async exec(productId: string): Promise<IProduct> {
        const response = await this.http.request<string>({
            method: 'GET',
            url: `product/${productId}`,
        });

        const dom = new JSDOM(response.data, { url: this.http.defaults.baseURL });
        const doc = dom.window.document;

        const { title, sku } = GetProductData.getFormattedTitleData(doc);

        return {
            title,
            sku,
            description: GetProductData.getDescription(doc),
            ...GetProductData.getPrice(doc),
            images: GetProductData.getImages(doc),
            characters: GetProductData.getCharacters(doc),
            sizes: GetProductData.getSizes(doc),
            colorIds: GetProductData.getColorIds(doc),
            offerIds: GetProductData.getOfferIds(doc),
        };
    }

    /**
     * @example
     *
     * Raw title example:
     * Свитшот #КТ6969, белый
     * Свитшот #1В2112, желтый
     * Брюки #5109, чёрный
     */
    private static getFormattedTitleData(doc: Document) {
        const rawTitle = doc.querySelector('h2.product-info__details-item-main-title')?.innerHTML;
        if (!rawTitle) throw new ProductDataException('rawTitle', rawTitle);

        const [title, skuAndOther] = 'Брюки #5109, чёрный'.split('#');
        if (!title) throw new ProductDataException('title', title);
        if (!skuAndOther) throw new ProductDataException('skuAndOther', skuAndOther);
        const [sku] = skuAndOther.split(',');
        if (!sku) throw new ProductDataException('sku', sku);

        return { title: title.trim(), sku: sku.trim() };
    }

    private static getDescription(doc: Document): IProduct['description'] {
        const rawDescription = doc.querySelector('div[itemprop="description"]')?.innerHTML;
        if (!rawDescription) throw new ProductDataException('rawDescription', rawDescription);

        const [description] = rawDescription.split('Вы можете заказать онлайн презентацию');
        if (typeof description !== 'string') throw new ProductDataException('description', description);

        return description.trim() || undefined;
    }

    private static getPrice(
        doc: Document
    ): Pick<ISaleProduct, 'isOnSale' | 'price' | 'salePrice'> | Pick<IBaseProduct, 'isOnSale' | 'price'> {
        const priceWrapperElement = doc.querySelector('div.product-info__details-price');
        if (!priceWrapperElement) throw new ProductDataException('priceWrapperElement', priceWrapperElement);

        const oldPriceElement = priceWrapperElement.querySelector('span.product-detail__old-price');

        const rawPrice = priceWrapperElement.querySelector('span[itemprop="price"]')?.innerHTML;
        if (!rawPrice) throw new ProductDataException('rawPrice', rawPrice);

        const oldPriceRaw = oldPriceElement ? oldPriceElement.innerHTML.split('&')[0] : undefined;
        if (oldPriceElement && !oldPriceRaw) throw new ProductDataException('oldPriceRaw', oldPriceRaw);

        const oldPrice = oldPriceRaw ? GetProductData.sanitizePrice(oldPriceRaw) : undefined;
        const price = typeof oldPrice === 'number' ? oldPrice : GetProductData.sanitizePrice(rawPrice);

        return oldPrice
            ? { isOnSale: true, price, salePrice: GetProductData.sanitizePrice(rawPrice) }
            : { isOnSale: false, price };
    }

    private static sanitizePrice(value: string): number {
        const price = +value;
        if (isNaN(price)) throw new ProductDataException('price', price);

        return price;
    }

    private static getImages(doc: Document): IProduct['images'] {
        const imagesWrapper = Array.from(
            doc.querySelectorAll<HTMLDivElement>('div.product-html-gallery > div.product-info__thumbs-wrapper')
        ).find(Boolean);
        if (!imagesWrapper) throw new ProductDataException('imagesWrapper', imagesWrapper);

        const images = Array.from(imagesWrapper.querySelectorAll<HTMLImageElement>('img.product-info__img')).map(
            (el) => new URL(el.src)
        );

        return images;
    }

    private static getCharacters(doc: Document): IProduct['characters'] {
        const characters = Array.from(
            doc.querySelectorAll('div.product-info__description div.product-info__description-item')
        ).map((element) => {
            const [rawName, value] = Array.from(element.querySelectorAll('span')).map((el) => el.innerHTML);
            if (!rawName) throw new ProductDataException('rawName', rawName);
            if (!value) throw new ProductDataException('value', value);
            const name = rawName.replace(/:/g, '').trim();

            return { name, value: value.trim() };
        });

        return characters;
    }

    private static getSizes(doc: Document): IProduct['sizes'] {
        const sizes = Array.from(doc.querySelectorAll('ul#product-sizes-ul input.product-size-quantity'))
            .map((el) => {
                const countTagContent = el.getAttribute('max');
                const count = countTagContent !== null ? +countTagContent : null;
                return { size: el.getAttribute('data-name'), count };
            })
            .filter((el): el is UnpackArray<IProduct['sizes']> => el.size !== null && el.count !== null);

        return sizes;
    }

    private static getColorIds(doc: Document): IProduct['colorIds'] {
        const colorsElement = Array.from(doc.querySelectorAll('div.product-info__colorpicker')).find(Boolean);
        if (!colorsElement) throw new ProductDataException('colorsElement', colorsElement);

        const attribute = 'data-pid';
        const colorIds = Array.from(colorsElement.querySelectorAll('img.product-info__colorpicker-image')).map(
            (el) => el.getAttribute(attribute) || ProductDataException.throw('colorIds', undefined, attribute)
        );

        return colorIds;
    }

    private static getOfferIds(doc: Document): IProduct['offerIds'] {
        return Array.from(
            doc.querySelectorAll<HTMLAnchorElement>(
                'section.products div.leafer__wrap div.k__show-details a.preview-card__slider-container'
            )
        ).map((el) => {
            const id = el.href.match(/\d+/)?.find(Boolean);
            if (!id) throw new ProductDataException('id', id);
            return id;
        });
    }
}
