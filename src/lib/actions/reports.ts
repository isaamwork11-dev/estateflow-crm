'use server';

import { startOfMonth, endOfMonth } from 'date-fns';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { Lead } from '@/lib/db/models/Lead';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { Deal } from '@/lib/db/models/Deal';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';

export async function getOwnerReportsAction() {
  const user = await requireOrgSession();
  await connectDB();
  const base = orgFilter(user);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [leadsThisMonth, hot, warm, cold, visits, won, lost, revenue] = await Promise.all([
    Lead.countDocuments({ ...base, createdAt: { $gte: monthStart, $lte: monthEnd } }),
    Lead.countDocuments({ ...base, priority: 'HOT' }),
    Lead.countDocuments({ ...base, priority: 'WARM' }),
    Lead.countDocuments({ ...base, priority: 'COLD' }),
    SiteVisit.countDocuments({ ...base, date: { $gte: monthStart, $lte: monthEnd } }),
    Lead.countDocuments({ ...base, status: 'Won' }),
    Lead.countDocuments({ ...base, status: 'Lost' }),
    Deal.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(user.organizationId!),
          dealDate: { $gte: monthStart, $lte: monthEnd },
        },
      },
      { $group: { _id: null, sales: { $sum: '$salePrice' }, commission: { $sum: '$commissionAmount' } } },
    ]),
  ]);

  const statusAgg = await Lead.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(user.organizationId!) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const rev = revenue[0] ?? { sales: 0, commission: 0 };

  return {
    leadsThisMonth,
    hot,
    warm,
    cold,
    visits,
    won,
    lost,
    totalSales: rev.sales,
    totalCommission: rev.commission,
    byStatus: statusAgg.map((s) => ({ status: s._id, count: s.count })),
  };
}
