import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardAnalytics(req: any): Promise<{
        success: boolean;
        data: {
            totalOrders: number;
            totalRevenue: number;
            activeButtons: number;
            chartData: {
                date: string;
                revenue: number;
            }[];
        };
    }>;
}
