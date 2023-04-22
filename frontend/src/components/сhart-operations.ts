import Chart from 'chart.js/auto';
import {NavigationControl} from "../services/navigation-control";
import {OperationsFilter} from "../services/operations-filter";
import {OperationsType} from "../types/operations-types/operations.type";
import {ConfigChartType} from "../types/config-chart.type";

export class ChartOperations {
    private chartIncome: Chart<"pie", number[], string> | null = null;
    readonly canvasIncome: HTMLCanvasElement | null;
    private chartExpense: Chart<"pie", number[], string> | null = null;
    readonly canvasExpense: HTMLCanvasElement | null;
    private allOperations: OperationsType[];
    private activeItemFilter: string = 'today';

    constructor() {
        NavigationControl.selectActiveNavigationItem(document.getElementById('nav-main') as HTMLElement);
        this.canvasIncome = document.getElementById('graph-operation-income') as HTMLCanvasElement;
        this.canvasExpense = document.getElementById('graph-operation-expense') as HTMLCanvasElement;
        this.allOperations = [];

        const that: ChartOperations = this;
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
                    that.processFilterChart.call(that);
                }
            });
        }

        this.processFilterChart();
    }

    private async processFilterChart(): Promise<void> {
        this.allOperations = await OperationsFilter.filter(this.activeItemFilter);

        if (this.allOperations) {
            this.processCreateChart();
        }
    };

    private processCreateChart(): void {
        let allIncome: OperationsType[] = [];
        let allExpense: OperationsType[] = [];

        this.allOperations.forEach((operation: OperationsType) => {
            if (operation.type === 'income') {
                if (allIncome.every(item => item.category !== operation.category)) {
                    allIncome.push(operation);
                } else {
                    let element: OperationsType | undefined = allIncome.find(item => item.category === operation.category);
                    if (element) {
                        element.amount += operation.amount;
                    }
                }
            } else if (operation.type === 'expense') {
                if (allExpense.every(item => item.category !== operation.category)) {
                    allExpense.push(operation);
                } else {
                    let element: OperationsType | undefined = allExpense.find(item => item.category === operation.category);
                    if (element) {
                        element.amount += operation.amount;
                    }
                }
            }
        });

        const configIncome: ConfigChartType = {
            type: 'pie',
            data: {
                labels: allIncome.map(income => income.category),
                datasets: [{
                    data: allIncome.map(income => income.amount)
                }]
            }
        };

        const configExpense: ConfigChartType = {
            type: 'pie',
            data: {
                labels: allExpense.map(expense => expense.category),
                datasets: [{
                    data: allExpense.map(expense => expense.amount)
                }]
            }
        };

        if (this.chartIncome != null) {
            this.chartIncome.destroy();
        }
        this.chartIncome = new Chart(this.canvasIncome as HTMLCanvasElement, configIncome);

        if (this.chartExpense != null) {
            this.chartExpense.destroy();
        }
        this.chartExpense = new Chart(this.canvasExpense as HTMLCanvasElement, configExpense);
    };
}