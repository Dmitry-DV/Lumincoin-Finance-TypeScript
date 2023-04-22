import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FormFieldType} from "../types/form-field.type";
import {SignupResponseType} from "../types/response-types/signup-response.type";
import {LoginResponseType} from "../types/response-types/login-response.type";
import {DefaultResponseType} from "../types/response-types/default-response.type";

export class Form {
    readonly sidebar: HTMLElement | null;
    readonly processElementButton: HTMLButtonElement | null;
    readonly page: 'login' | 'signup';
    private fields: FormFieldType[];

    constructor(page: 'login' | 'signup') {
        this.sidebar = document.getElementById('sidebar');
        if (this.sidebar) {
            this.sidebar.style.display = "none";
        }
        this.processElementButton = null;
        this.page = page;

        this.fields = [
            {
                name: "email",
                id: "email",
                element: null,
                regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                valid: false,
            },
            {
                name: "password",
                id: "password",
                element: null,
                regex: /((?=.*\d)(?=.*[A-Z]).{8,})/,
                valid: false,
            }
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    name: "fullName",
                    id: "full-name",
                    element: null,
                    regex: /^[А-Я][а-я]+\s[А-Я][а-я]+\s[А-Я][а-я]+\s*$/,
                    valid: false,
                },
                {
                    name: "passwordRepeat",
                    id: "password-repeat",
                    element: null,
                    regex: /((?=.*\d)(?=.*[A-Z]).{8,})/,
                    valid: false,
                }
            );
        }

        const that: Form = this;
        this.fields.forEach((field: FormFieldType) => {
            field.element = document.getElementById(field.id) as HTMLInputElement;
            if (field.element) {
                field.element.onchange = function (e) {
                    that.validateField(field, (e.target as HTMLInputElement));
                }
            }
        });

        this.processElementButton = document.getElementById("process") as HTMLButtonElement;
        if (this.processElementButton) {
            this.processElementButton.onclick = function () {
                that.processForm();
            };
        }
    };

    private validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = "red";
            field.valid = false;
        } else {
            element.removeAttribute("style");
            field.valid = true;
        }
        this.validateForm();
    };

    private validatePassword(): boolean {
        if (this.page === 'signup') {
            const password = this.fields.find(item => item.name === "password")?.element?.value;
            const passwordRepeat = this.fields.find(item => item.name === "passwordRepeat")?.element?.value;

            if (password !== passwordRepeat) {
                return false;
            }
        }
        return true;
    };

    private validateForm(): boolean {
        const validForm = this.fields.every(item => item.valid);
        const isValid = validForm ? validForm : validForm;

        if (isValid && this.validatePassword()) {
            if (this.processElementButton) {
                this.processElementButton.removeAttribute("disabled");
            }
        } else {
            if (this.processElementButton) {
                this.processElementButton.setAttribute("disabled", "disabled");
            }
        }
        return isValid;
    };

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email')?.element?.value;
            const password = this.fields.find(item => item.name === 'password')?.element?.value;

            if (this.page === 'signup') {
                try {
                    const result: DefaultResponseType | SignupResponseType = await CustomHttp.request(config.host + '/signup', "POST", {
                        name: this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[1],
                        lastName: this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[0],
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === 'passwordRepeat')?.element?.value
                    })

                    if (result) {
                        if ((result as DefaultResponseType).error) {
                            throw new Error((result as DefaultResponseType).message);
                        }
                    }
                } catch (error) {
                    return console.log(error);
                }
            }
            try {
                const result: DefaultResponseType | LoginResponseType = await CustomHttp.request(config.host + '/login', "POST", {
                    email: email,
                    password: password,
                })

                if (result) {
                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    if (!(result as LoginResponseType).tokens.accessToken || !(result as LoginResponseType).tokens.refreshToken
                        || !(result as LoginResponseType).user.id || !(result as LoginResponseType).user.name || !(result as LoginResponseType).user.lastName) {
                        throw new Error();
                    }
                    Auth.setTokens((result as LoginResponseType).tokens.accessToken, (result as LoginResponseType).tokens.refreshToken);
                    Auth.setUserInfo({
                        name: (result as LoginResponseType).user.name,
                        lastName: (result as LoginResponseType).user.lastName,
                        userId: (result as LoginResponseType).user.id
                    });
                    location.href = '/#';
                    if (this.sidebar) {
                        this.sidebar.style.display = "flex";
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }
    };
}