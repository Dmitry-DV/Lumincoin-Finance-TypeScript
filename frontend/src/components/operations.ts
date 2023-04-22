import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {NavigationControl} from "../services/navigation-control";
import {Balance} from "../services/balance";
import {OperationsFilter} from "../services/operations-filter";
import {OperationsType} from "../types/operations-types/operations.type";
import {DefaultResponseType} from "../types/response-types/default-response.type";

export class Operations {
    readonly tableBody: HTMLElement | null;
    private dataTable: OperationsType[];
    private activeItemFilter: string = 'today';

    constructor() {
        NavigationControl.selectActiveNavigationItem(document.getElementById('nav-operations') as HTMLElement);
        this.tableBody = document.getElementById('table-body');
        this.dataTable = [];

        const that: Operations = this;
        const filter: HTMLElement | null = document.getElementById('filter-menu-button');
        if (filter) {
            filter.addEventListener('click', function (e) {
                const filterItems: NodeListOf<HTMLElement> | null = document.querySelectorAll('.filter-menu-btn') as NodeListOf<HTMLElement>;
                const target: HTMLElement | null = e.target as HTMLElement;

                if (filterItems && target) {
                    Array.from(filterItems).forEach((filterItem: HTMLElement) => {
                        filterItem.classList.remove('active');
                    });

                    target.classList.add('active');
                    that.activeItemFilter = target.id;
                    that.processFilterTable.call(that);
                }
            });
        }

        this.processFilterTable();
    };

    private async processFilterTable(): Promise<void> {
        this.dataTable = await OperationsFilter.filter(this.activeItemFilter);

        if (this.dataTable) {
            this.processCreateTable();
        }
    };

    private processCreateTable(): void {
        const that = this;
        if (this.tableBody) {
            this.tableBody.innerHTML = '';
        }

        this.dataTable.forEach((itemTable: OperationsType) => {
            const tableTr: HTMLElement | null = document.createElement('tr');
            tableTr.className = 'table-element';
            tableTr.setAttribute('data-id', String(itemTable.id));

            const tableId: HTMLElement | null = document.createElement('td');
            tableId.innerText = String(itemTable.id);

            const tableType: HTMLElement | null = document.createElement('td');
            if (itemTable.type === 'income') {
                tableType.innerText = 'Доход';
                tableType.className = 'table-income';
            } else if (itemTable.type === 'expense') {
                tableType.innerText = 'Расход';
                tableType.className = 'table-expense';
            }

            const tableCategory: HTMLElement | null = document.createElement('td');
            tableCategory.innerText = itemTable.category;

            const tableAmount: HTMLElement | null = document.createElement('td');
            tableAmount.innerText = String(itemTable.amount);

            const tableDate: HTMLElement | null = document.createElement('td');
            tableDate.innerText = itemTable.date;

            const tableComment: HTMLElement | null = document.createElement('td');
            tableComment.innerText = itemTable.comment;

            const tableIcon: HTMLElement | null = document.createElement('td');
            tableIcon.className = 'table-icon';

            const tableIconDelete: HTMLElement | null = document.createElement('button');
            tableIconDelete.className = 'btn';
            tableIconDelete.setAttribute('data-bs-target', '#exampleModal');
            tableIconDelete.setAttribute('data-bs-toggle', 'modal');
            const tableIconDeleteImg: HTMLElement | null = document.createElement('img');
            tableIconDeleteImg.setAttribute('src', '/images/icon-delete.png');
            tableIconDeleteImg.setAttribute('alt', 'icon-delete');
            tableIconDelete.appendChild(tableIconDeleteImg);

            const tableIconUpdate: HTMLElement | null = document.createElement('button');
            tableIconUpdate.className = 'btn';
            const tableIconUpdateImg: HTMLElement | null = document.createElement('img');
            tableIconUpdateImg.setAttribute('src', '/images/icon-update.png');
            tableIconUpdateImg.setAttribute('alt', 'icon-update');
            tableIconUpdate.appendChild(tableIconUpdateImg);

            tableIcon.appendChild(tableIconDelete);
            tableIcon.appendChild(tableIconUpdate);

            tableTr.appendChild(tableId);
            tableTr.appendChild(tableType);
            tableTr.appendChild(tableCategory);
            tableTr.appendChild(tableAmount);
            tableTr.appendChild(tableDate);
            tableTr.appendChild(tableComment);
            tableTr.appendChild(tableIcon);

            if (that.tableBody) {
                that.tableBody.appendChild(tableTr);
            }

            tableIconDelete.addEventListener('click', function () {
                that.processDeleteOperation(tableTr, that);
            });

            tableIconUpdate.addEventListener('click', function () {
                location.href = "#/operations-update?"
                    + "id=" + itemTable.id
                    + "&type=" + itemTable.type
                    + "&category=" + itemTable.category
                    + "&amount=" + itemTable.amount
                    + "&date=" + itemTable.date
                    + "&comment=" + itemTable.comment;
            });
        });
    };

    processDeleteOperation(tableElement: HTMLElement, that: Operations) {
        const operationActiveElementId: string | null = tableElement.getAttribute('data-id');
        const buttonDeleteOperation: HTMLButtonElement | null = document.getElementById('delete-operation') as HTMLButtonElement;

        if (buttonDeleteOperation && operationActiveElementId) {
            buttonDeleteOperation.onclick = async function () {
                try {
                    const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + operationActiveElementId, 'DELETE');
                    if (result) {
                        if (result.error) {
                            throw new Error(result.message);
                        }
                        if (that.tableBody) {
                            that.tableBody.innerHTML = '';
                        }
                        if (config.balance) {
                            config.balance.innerText = String(await Balance.balanceUpdate());
                        }
                        that.processFilterTable();
                    }
                } catch (error) {
                    console.log(error);
                }
            };
        }
    };
}