import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {BalanceType} from "../types/balance.type";

export class Balance {
    public static async balanceInfo(): Promise<number> {
        try {
            const result: BalanceType = await CustomHttp.request(config.host + '/balance');
            if (result.balance) {
                return result.balance;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error);
            return 0;
        }
    };

    public static async balanceUpdate(): Promise<number> {
        const balanceInfo: number = await this.balanceInfo();
        try {
            const result: BalanceType = await CustomHttp.request(config.host + '/balance', 'PUT', {
                newBalance: balanceInfo,
            });
            if (result.balance) {
                return result.balance;
            } else {
                return 0;
            }
        } catch (error) {
            console.log(error);
            return 0;
        }
    };
}