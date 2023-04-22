export type ConfigChartType = {
    type: 'pie',
    data: {
        labels: string[],
        datasets: [{
            data: number[],
        }]
    }
}