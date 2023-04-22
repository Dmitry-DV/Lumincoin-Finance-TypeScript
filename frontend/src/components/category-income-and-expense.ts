import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {NavigationControl} from "../services/navigation-control";
import {Balance} from "../services/balance";
import {CategoriesType} from "../types/category-types/categories.type";
import {OperationsType} from "../types/operations-types/operations.type";
import {DefaultResponseType} from "../types/response-types/default-response.type";

export class CategoryIncomeAndExpense {
    readonly page: 'income' | 'expense';
    private categoryMain: HTMLElement | null;
    private dataCategories: CategoriesType[];

    constructor(page: 'income' | 'expense') {
        this.page = page;
        switch (this.page) {
            case 'income':
                NavigationControl.selectActiveNavigationItem(document.getElementById('nav-income') as HTMLElement, document.getElementById('nav-category') as HTMLElement);
                break;
            case 'expense':
                NavigationControl.selectActiveNavigationItem(document.getElementById('nav-expense') as HTMLElement, document.getElementById('nav-category') as HTMLElement);
                break;
        }

        this.categoryMain = document.getElementById('category-items');
        this.dataCategories = [];
        this.init();
    };

    private async init(): Promise<void> {
        if (this.page === 'income') {
            try {
                this.dataCategories = await CustomHttp.request(config.host + '/categories/income');
                // if (result) {
                //     if (result.error) {
                //         throw new Error(result.message);
                //     }
                this.processCreateCategories();
                // }
            } catch (error) {
                console.log(error);
            }
        } else if (this.page === 'expense') {
            try {
                this.dataCategories = await CustomHttp.request(config.host + '/categories/expense');
                // if (result) {
                //     if (result.error) {
                //         throw new Error(result.message);
                //     }
                this.processCreateCategories();
                // }
            } catch (error) {
                console.log(error);
            }
        }
    };

    private processCreateCategories(): void {
        const that: CategoryIncomeAndExpense = this;

        const linkCreateCategory: HTMLElement | null = document.createElement("a");
        linkCreateCategory.className = "text-decoration-none category-item category-item-get";
        linkCreateCategory.innerText = "+";
        if (this.page === 'income') {
            linkCreateCategory.setAttribute('href', '#/income-create');
        } else if (this.page === 'expense') {
            linkCreateCategory.setAttribute('href', '#/expense-create');
        }
        if (this.categoryMain) {
            this.categoryMain.appendChild(linkCreateCategory);
        }


        this.dataCategories.forEach((category: CategoriesType) => {
            const categoryElement: HTMLElement | null = document.createElement("div");
            categoryElement.className = "category-item";
            categoryElement.setAttribute('data-id', String(category.id));
            categoryElement.setAttribute('data-title', category.title);

            const categoryTitleElement: HTMLElement | null = document.createElement("h2");
            categoryTitleElement.className = 'category-item-title';
            categoryTitleElement.innerText = category.title;

            const categoryActionElement: HTMLElement | null = document.createElement("div");
            categoryActionElement.className = 'category-item-actions d-flex align-items-center';
            const categoryActionLinkElement: HTMLElement | null = document.createElement("a");
            if (this.page === 'income') {
                categoryActionLinkElement.setAttribute('href', '#/income-update?id=' + String(category.id) + "&title=" + category.title);
            } else if (this.page === 'expense') {
                categoryActionLinkElement.setAttribute('href', '#/expense-update?id=' + String(category.id) + "&title=" + category.title);
            }
            const categoryActionLinkButtonElement: HTMLElement | null = document.createElement("button");
            categoryActionLinkButtonElement.className = 'btn btn-primary btn-create';
            categoryActionLinkButtonElement.innerText = 'Редактировать';
            const categoryActionButtonDeleteElement: HTMLElement | null = document.createElement("button");
            categoryActionButtonDeleteElement.className = 'btn btn-danger btn-delete';
            categoryActionButtonDeleteElement.setAttribute('data-bs-toggle', 'modal');
            categoryActionButtonDeleteElement.setAttribute('data-bs-target', '#exampleModal');
            categoryActionButtonDeleteElement.innerText = 'Удалить';

            categoryActionLinkElement.appendChild(categoryActionLinkButtonElement);
            categoryActionElement.appendChild(categoryActionLinkElement);
            categoryActionElement.appendChild(categoryActionButtonDeleteElement);

            categoryElement.appendChild(categoryTitleElement);
            categoryElement.appendChild(categoryActionElement);

            if (that.categoryMain) {
                that.categoryMain.prepend(categoryElement);
            }

            categoryActionButtonDeleteElement.addEventListener('click', function () {
                that.processDeleteCategories(categoryElement);
            });
        });
    };

    private async processDeleteCategories(categoryElement: HTMLElement): Promise<void> {
        const that: CategoryIncomeAndExpense = this;
        const categoryActiveElementId: string | null = categoryElement.getAttribute('data-id');
        const categoryActiveElementTitle: string | null = categoryElement.getAttribute('data-title');
        const buttonDeleteCategory: HTMLButtonElement | null = document.getElementById('delete-category') as HTMLButtonElement;

        if (categoryActiveElementId && categoryActiveElementTitle && buttonDeleteCategory) {
            buttonDeleteCategory.onclick = async function () {
                let allOperations: OperationsType[] = [];
                try {
                    allOperations = await CustomHttp.request(config.host + '/operations/?period=all');
                } catch (error) {
                    console.log(error);
                    return;
                }

                allOperations.forEach((operation: OperationsType) => {
                    if (operation.category === categoryActiveElementTitle) {
                        CategoryIncomeAndExpense.processDeleteOperation(operation.id);
                    }
                });

                if (that.page === 'income') {
                    try {
                        const result: DefaultResponseType = await CustomHttp.request(config.host + '/categories/income/' + categoryActiveElementId, 'DELETE');
                        if (result) {
                            if (result.error) {
                                throw new Error(result.message);
                            }
                            if (that.categoryMain) {
                                that.categoryMain.innerHTML = '';
                            }
                            that.init();
                        }
                    } catch (error) {
                        console.log(error);
                        return;
                    }
                } else if (that.page === 'expense') {
                    try {
                        const result: DefaultResponseType = await CustomHttp.request(config.host + '/categories/expense/' + categoryActiveElementId, 'DELETE');
                        if (result) {
                            if (result.error) {
                                throw new Error(result.message);
                            }
                            if (that.categoryMain) {
                                that.categoryMain.innerHTML = '';
                            }
                            that.init();
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            };
        }
    };

    private static async processDeleteOperation(operationId: number): Promise<void> {
        try {
            const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + operationId, 'DELETE');
            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
                if (config.balance) {
                    config.balance.innerText = String(await Balance.balanceUpdate());
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
}