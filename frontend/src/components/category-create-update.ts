import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {QueryParamsType} from "../types/query-params.type";
import {DefaultResponseType} from "../types/response-types/default-response.type";
import {CategoriesType} from "../types/category-types/categories.type";

export class CategoryCreateUpdate {
    readonly inputCategory: HTMLInputElement | null;
    private routeParams: QueryParamsType;
    readonly page: 'income-create' | 'expense-create' | 'income-update' | 'expense-update';

    constructor(page: 'income-create' | 'expense-create' | 'income-update' | 'expense-update') {
        this.inputCategory = document.getElementById('input-category') as HTMLInputElement;
        this.routeParams = UrlManager.getQueryParams();
        this.page = page;

        this.init();

        const that: CategoryCreateUpdate = this;

        const buttonSave: HTMLButtonElement | null = document.getElementById('save') as HTMLButtonElement;
        if (buttonSave) {
            buttonSave.onclick = function () {
                that.processCreateUpdateCategory();
            };
        }
    };

    private init(): void {
        if (this.page === 'income-update' || this.page === 'expense-update') {
            if (this.inputCategory) {
                this.inputCategory.value = this.routeParams.title;
            }
        }
    };

    private async processCreateUpdateCategory(): Promise<void> {
        if (this.inputCategory?.value) {
            this.inputCategory.removeAttribute("style");

            if (this.page === 'income-create') {
                try {
                    const result: DefaultResponseType | CategoriesType = await CustomHttp.request(config.host + '/categories/income/', 'POST', {
                        title: this.inputCategory.value
                    });
                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }
                        location.href = '#/income';
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (this.page === 'expense-create') {
                try {
                    const result: DefaultResponseType | CategoriesType = await CustomHttp.request(config.host + '/categories/expense/', 'POST', {
                        title: this.inputCategory.value
                    });
                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }
                        location.href = '#/expense';
                    }
                } catch (error) {
                    console.log(error);
                }
            }


            if (this.page === 'income-update') {
                try {
                    const result: DefaultResponseType | CategoriesType = await CustomHttp.request(config.host + '/categories/income/' + Number(this.routeParams.id), 'PUT', {
                        title: this.inputCategory.value
                    });
                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }
                        location.href = '#/income';
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (this.page === 'expense-update') {
                try {
                    const result: DefaultResponseType | CategoriesType = await CustomHttp.request(config.host + '/categories/expense/' + Number(this.routeParams.id), 'PUT', {
                        title: this.inputCategory.value
                    });
                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }
                        location.href = '#/expense';
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        } else {
            this.inputCategory!.style.borderColor = "red";
        }
    };
}