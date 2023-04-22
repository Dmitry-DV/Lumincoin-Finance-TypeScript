import {UrlManager} from "../utils/url-manager";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {QueryParamsType} from "../types/query-params.type";
import {CategoriesType} from "../types/category-types/categories.type";
import {OperationsType} from "../types/operations-types/operations.type";
import {DefaultResponseType} from "../types/response-types/default-response.type";

export class OperationCreateUpdate {
    readonly page: 'update-operation' | 'create-operation';
    private categoryIncome: CategoriesType[];
    private categoryExpense: CategoriesType[];
    private routeParams: QueryParamsType;

    constructor(page: 'update-operation' | 'create-operation') {
        this.page = page;
        this.categoryIncome = [];
        this.categoryExpense = [];
        this.routeParams = UrlManager.getQueryParams();

        this.init();

        const that: OperationCreateUpdate = this;

        const buttonSave: HTMLButtonElement | null = document.getElementById('save') as HTMLButtonElement;
        if (buttonSave) {
            buttonSave.onclick = function () {
                that.processUpdateOperation();
            };
        }
    };

    private async init(): Promise<void> {
        try {
            this.categoryIncome = await CustomHttp.request(config.host + '/categories/income');
            // if (result) {
            //     if (result.error) {
            //         throw new Error(result.message);
            //     }
            // this.categoryIncome = result;
            // }
        } catch (error) {
            console.log(error);
        }

        try {
            this.categoryExpense = await CustomHttp.request(config.host + '/categories/expense');
            // if (result) {
            //     if (result.error) {
            //         throw new Error(result.message);
            //     }
            //     this.categoryExpense = result;
            // }
        } catch (error) {
            console.log(error);
        }

        this.infoOperation();
    };

    private infoOperation(): void {
        const that: OperationCreateUpdate = this;
        const selectType: HTMLSelectElement | null = document.getElementById('select-type') as HTMLSelectElement;
        const selectOptionType: HTMLCollectionOf<HTMLOptionElement> = document.getElementsByClassName('select-option-type') as HTMLCollectionOf<HTMLOptionElement>;
        const selectCategory: HTMLSelectElement | null = document.getElementById('select-category') as HTMLSelectElement;
        const inputAmount: HTMLInputElement | null = document.getElementById('input-amount') as HTMLInputElement;
        const inputDate: HTMLInputElement | null = document.getElementById('input-date') as HTMLInputElement;
        const inputComment: HTMLInputElement | null = document.getElementById('input-comment') as HTMLInputElement;

        Array.from(selectOptionType).find((optionItem: HTMLOptionElement) => {
            if (optionItem.value === that.routeParams.type) {
                // if (optionItem.hasOwnProperty('selected')) {
                optionItem['selected'] = true;
                // }

                if (that.routeParams.type === 'income') {
                    that.categoryIncome.forEach((incomeItem: CategoriesType) => {
                        const optionCategory: HTMLOptionElement = document.createElement('option');
                        optionCategory.innerText = incomeItem.title;
                        optionCategory.setAttribute('data-id', String(incomeItem.id));
                        if (that.page === 'update-operation') {
                            if (incomeItem.title === that.routeParams.category) {
                                optionCategory.selected = true;
                            }
                        }
                        selectCategory.appendChild(optionCategory);
                    });

                } else if (that.routeParams.type === 'expense') {
                    that.categoryExpense.forEach((expenseItem: CategoriesType) => {
                        const optionCategory: HTMLOptionElement = document.createElement('option');
                        optionCategory.innerText = expenseItem.title;
                        optionCategory.setAttribute('data-id', String(expenseItem.id));
                        if (that.page === 'update-operation') {
                            if (expenseItem.title === that.routeParams.category) {
                                optionCategory.selected = true;
                            }
                        }
                        selectCategory.appendChild(optionCategory);
                    });
                }
                if (this.page === 'update-operation') {
                    inputAmount.value = that.routeParams.amount;
                    inputDate.value = that.routeParams.date;
                    inputComment.value = that.routeParams.comment;
                }
            }
        });

        selectType.addEventListener('change', function (e) {
            selectCategory.innerHTML = '';
            if (selectType.value === 'income') {
                that.categoryIncome.forEach(incomeItem => {
                    const optionCategory: HTMLOptionElement = document.createElement('option');
                    optionCategory.innerText = incomeItem.title;
                    optionCategory.setAttribute('data-id', String(incomeItem.id));
                    selectCategory.appendChild(optionCategory);
                })
            } else if (selectType.value === 'expense') {
                that.categoryExpense.forEach(expenseItem => {
                    const optionCategory: HTMLOptionElement = document.createElement('option');
                    optionCategory.innerText = expenseItem.title;
                    optionCategory.setAttribute('data-id', String(expenseItem.id));
                    selectCategory.appendChild(optionCategory);
                })
            }
        });
    };

    private static validateFields(): boolean {
        const fields: any = document.getElementsByClassName('control-input');
        return Array.from(fields).every((field: any) => {
            if (!field.value) {
                field.style.borderColor = "red";
                return false;
            } else {
                field.removeAttribute("style");
                return true;
            }
        });
    };

    private async processUpdateOperation(): Promise<void> {
        if (OperationCreateUpdate.validateFields()) {
            const type: HTMLSelectElement | null = document.getElementById('select-type') as HTMLSelectElement;
            const amount: HTMLInputElement | null = document.getElementById('input-amount') as HTMLInputElement;
            const date: HTMLInputElement | null = document.getElementById('input-date') as HTMLInputElement;
            const comment: HTMLInputElement | null = document.getElementById('input-comment') as HTMLInputElement;
            const categoryOptions: HTMLSelectElement | null = document.getElementById('select-category') as HTMLSelectElement;
            const categoryActiveOption: HTMLOptionElement | undefined = Array.from(categoryOptions.options).find((categoryOption: HTMLOptionElement) => {
                return categoryOption.selected;
            });
            const categoryId: string | null = categoryActiveOption ? categoryActiveOption.getAttribute('data-id') : null;

            if (type && amount && date && comment && categoryId != null) {
                if (this.page === 'update-operation') {
                    try {
                        const result: DefaultResponseType | OperationsType = await CustomHttp.request(config.host + '/operations/' + this.routeParams.id, "PUT", {
                            type: type?.value,
                            amount: Number(amount?.value),
                            date: date?.value,
                            comment: comment?.value,
                            category_id: Number(categoryId)
                        });
                        if (result) {
                            if ((result as DefaultResponseType).error) {
                                throw new Error((result as DefaultResponseType).message);
                            }
                            if (config.balance) {
                                config.balance.innerText = String(await Balance.balanceUpdate());
                            }
                            location.href = '#/operations';
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else if (this.page === 'create-operation') {
                    try {
                        const result: DefaultResponseType | OperationsType = await CustomHttp.request(config.host + '/operations', "POST", {
                            type: type?.value,
                            amount: Number(amount?.value),
                            date: date?.value,
                            comment: comment?.value,
                            category_id: Number(categoryId)
                        });
                        if (result) {
                            if ((result as DefaultResponseType).error) {
                                throw new Error((result as DefaultResponseType).message);
                            }
                            if (config.balance) {
                                config.balance.innerText = String(await Balance.balanceUpdate());
                            }
                            location.href = '#/operations';
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    };
}