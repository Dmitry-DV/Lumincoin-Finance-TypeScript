import {Form} from "./components/form";
import {CategoryIncomeAndExpense} from "./components/category-income-and-expense";
import {CategoryCreateUpdate} from "./components/category-create-update";
import {Operations} from "./components/operations";
import {OperationCreateUpdate} from "./components/operation-create-update";
import {ChartOperations} from "./components/сhart-operations";
import {Auth} from "./services/auth";
import {Balance} from "./services/balance";
import config from "../config/config";
import {RouteType} from "./types/route.type";
import {UserInfoType} from "./types/user-info.type";

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    readonly profileFullName: HTMLElement | null;

    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.profileFullName = document.getElementById('profile-Full-Name');

        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/main.html',
                styles: '',
                load: () => {
                    new ChartOperations();
                },
            },
            {
                route: '#/login',
                title: 'Вход',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                },
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                },
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income.html',
                styles: 'styles/category-income-and-expense.css',
                load: () => {
                    new CategoryIncomeAndExpense('income');
                },
            },
            {
                route: '#/income-update',
                title: 'Редактировать доход',
                template: 'templates/income-update.html',
                styles: 'styles/category-create-change.css',
                load: () => {
                    new CategoryCreateUpdate('income-update');
                },
            },
            {
                route: '#/income-create',
                title: 'Создать категорию дохода',
                template: 'templates/income-create.html',
                styles: 'styles/category-create-change.css',
                load: () => {
                    new CategoryCreateUpdate('income-create');
                },
            },

            {
                route: '#/expense',
                title: 'Расходы',
                template: 'templates/expense.html',
                styles: 'styles/category-income-and-expense.css',
                load: () => {
                    new CategoryIncomeAndExpense('expense');
                },
            },
            {
                route: '#/expense-update',
                title: 'Редактировать расходы',
                template: 'templates/expense-update.html',
                styles: 'styles/category-create-change.css',
                load: () => {
                    new CategoryCreateUpdate('expense-update');
                },
            },
            {
                route: '#/expense-create',
                title: 'Создать категорию расхода',
                template: 'templates/expense-create.html',
                styles: 'styles/category-create-change.css',
                load: () => {
                    new CategoryCreateUpdate('expense-create');
                },
            },
            {
                route: '#/operations',
                title: 'Операции',
                template: 'templates/operations.html',
                styles: 'styles/operations.css',
                load: () => {
                    new Operations();
                },
            },
            {
                route: '#/operations-update',
                title: 'Редактировать операцию',
                template: 'templates/operations-update.html',
                styles: 'styles/category-create-change.css',
                load: () => {
                    new OperationCreateUpdate('update-operation');
                },
            },
            {
                route: '#/operations-create',
                title: 'Создать операцию',
                template: 'templates/operations-create.html',
                styles: 'styles/category-create-change.css',
                load: () => {
                    new OperationCreateUpdate('create-operation');
                },
            },
        ];
    };

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.href = '#/login';
                return;
            }
        }

        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return;
        }

        if (!this.contentElement || !this.stylesElement || !this.titleElement || !this.profileFullName) {
            if (urlRoute === '#/') {
                return;
            } else {
                window.location.href = '#/';
                return;
            }
        }

        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        const userInfo: UserInfoType | null = Auth.getUserInfo();
        const accessToken: string | null = localStorage.getItem(Auth.accessTokensKey);
        if (userInfo && accessToken) {
            if (config.balance) {
                config.balance.innerText = String(await Balance.balanceInfo());
            }
            this.profileFullName.innerText = userInfo.name + ' ' + userInfo.lastName;
        }


        newRoute.load();
    }
}