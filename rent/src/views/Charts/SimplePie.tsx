/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from 'react-apexcharts'
import { COLORS } from '@/constants/chart.constant'

type Props = {
    labels: string[];
    series: number[];
    height?: number;
    ptype?: any;
};

const SimplePie = ({ labels, series , height = 300, ptype="pie"}: Props) => {
    return (
        <Chart
            options={{
                colors: COLORS,
                labels: labels,
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: 200,
                            },
                            legend: {
                                position: 'bottom',
                            },
                        },
                    },
                ],
            }}
            series={series}
            height={height}
            type={ptype}
        />
    )
}

export default SimplePie