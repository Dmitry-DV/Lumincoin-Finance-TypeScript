import config from "../../config/config";
import {UserInfoType} from "../types/user-info.type";
import {RefreshResponseType} from "../types/response-types/refresh-response.type";
import {LogoutResponseType} from "../types/response-types/logout-response.type";

export class Auth {
    public static accessTokensKey: string = 'accessTokens';
    private static refreshTokensKey: string = 'refreshTokens';
    private static userInfoKey: string = 'userInfo';

    public static async processUnauthorizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokensKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            })
            if (response && response.status === 200) {
                const result: RefreshResponseType | null = await response.json();
                if (result && !result.error && result.tokens.accessToken && result.tokens.refreshToken) {
                    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    return true;
                }
            }
        }
        this.removeTokens();
        location.href = '#/login';
        return false;
    };

    public static async logout(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokensKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            })
            if (response && response.status === 200) {
                const result: LogoutResponseType | null = await response.json();
                if (result && !result.error) {
                    Auth.removeTokens();
                    localStorage.removeItem(this.userInfoKey);
                    return true;
                }
            }
        }
        return false;
    };

    public static setTokens(accessTokens: string, refreshTokens: string): void {
        localStorage.setItem(this.accessTokensKey, accessTokens);
        localStorage.setItem(this.refreshTokensKey, refreshTokens);
    };

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokensKey);
        localStorage.removeItem(this.refreshTokensKey);
    };

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    };

    public static getUserInfo(): UserInfoType | null {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }

        return null;
    };
}