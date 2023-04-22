import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {OperationsType} from "../types/operations-types/operations.type";

export class OperationsFilter {
    public static async filter(activeItemFilter: string): Promise<OperationsType[]> {
        let result: OperationsType[] = [];

        const dateFrom: HTMLInputElement | null = document.getElementById('dateFrom') as HTMLInputElement;
        const dateTo: HTMLInputElement | null = document.getElementById('dateTo') as HTMLInputElement;

        try {
            switch (activeItemFilter) {
                case 'today':
                    result = await CustomHttp.request(config.host + '/operations');
                    break;
                case 'week':
                    result = await CustomHttp.request(config.host + '/operations/?period=week');
                    break;
                case 'month':
                    result = await CustomHttp.request(config.host + '/operations/?period=month');
                    break;
                case 'year':
                    result = await CustomHttp.request(config.host + '/operations/?period=year');
                    break;
                case 'all':
                    result = await CustomHttp.request(config.host + '/operations/?period=all');
                    break;
                case 'interval':
                    if (dateFrom.value && dateTo.value) {
                        result = await CustomHttp.request(config.host +
                            '/operations?period=interval&dateFrom=' + dateFrom.value + '&dateTo=' + dateTo.value);
                    }
                    break;
                default:
                    console.log('Invalid filter');
                    break;
            }
            return result && result.length > 0 ? result : [];
        } catch (error) {
            console.log(error);
            return [];
        }
    };
}