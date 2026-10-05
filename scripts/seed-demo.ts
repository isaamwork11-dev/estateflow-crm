import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Organization } from '../src/lib/db/models/Organization';
import { User } from '../src/lib/db/models/User';
import { Lead } from '../src/lib/db/models/Lead';
import { Property } from '../src/lib/db/models/Property';
import { Task } from '../src/lib/db/models/Task';
import { SiteVisit } from '../src/lib/db/models/SiteVisit';
import { Deal } from '../src/lib/db/models/Deal';
import { Activity } from '../src/lib/db/models/Activity';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri!);

  await Promise.all([
    Organization.deleteMany({ slug: 'demo-estateflow' }),
    User.deleteMany({ email: { $in: ['owner@demo.estateflow.pk', 'agent@demo.estateflow.pk'] } }),
  ]);

  const org = await Organization.create({
    name: 'Demo EstateFlow Realty (Sample Data)',
    slug: 'demo-estateflow',
    isDemo: true,
    phone: '+92-300-0000000',
    whatsapp: '+923000000000',
    address: 'Karachi, Pakistan',
    currency: 'PKR',
  });

  const passwordHash = await bcrypt.hash('Demo@12345', 10);
  const owner = await User.create({
    email: 'owner@demo.estateflow.pk',
    passwordHash,
    name: 'Ahmed Khan',
    role: 'COMPANY_OWNER',
    organizationId: org._id,
  });
  const agent = await User.create({
    email: 'agent@demo.estateflow.pk',
    passwordHash,
    name: 'Demo Agent Sara',
    role: 'SALES_AGENT',
    organizationId: org._id,
    phone: '+92-301-0000000',
  });

  const properties = await Property.insertMany([
    {
      organizationId: org._id,
      propertyCode: 'DHA-FLAT-101',
      title: '1 Bedroom Apartment DHA Phase 6',
      transactionType: 'sale',
      price: 18500000,
      propertyType: 'flat',
      area: 'DHA Phase 6',
      city: 'Karachi',
      size: 850,
      bedrooms: 1,
      bathrooms: 1,
      location: 'DHA Phase 6',
      society: 'DHA',
      description: 'Demo listing — bright 1 bed apartment near main boulevard.',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      availability: 'available',
      assignedTo: agent._id,
      isDemo: true,
    },
    {
      organizationId: org._id,
      propertyCode: 'CLF-HOUSE-22',
      title: '3 Bedroom House Clifton',
      transactionType: 'sale',
      price: 48000000,
      propertyType: 'house',
      area: 'Clifton Block 5',
      city: 'Karachi',
      size: 2400,
      bedrooms: 3,
      bathrooms: 4,
      location: 'Clifton',
      description: 'Demo listing — spacious family home.',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
      availability: 'available',
      assignedTo: agent._id,
      isDemo: true,
    },
  ]);

  const lead = await Lead.create({
    organizationId: org._id,
    name: 'Ahmed Khan (Demo Lead)',
    phone: '+923001112233',
    whatsapp: '+923001112233',
    budget: 20000000,
    preferredArea: 'DHA',
    propertyType: 'flat',
    transactionType: 'sale',
    purpose: 'living',
    buyingTimeline: 'Within 30 days',
    source: 'Referral',
    assignedTo: owner._id,
    status: 'QUALIFIED',
    priority: 'HOT',
    score: 60,
    scoreReasons: ['Budget provided ✓', 'Area provided ✓', 'Buying within 30 days ✓', 'Budget matches 1 property', 'Site visit scheduled ✓'],
    isDemo: true,
  });

  await Task.create({
    organizationId: org._id,
    leadId: lead._id,
    type: 'call',
    title: 'Call customer',
    dueAt: new Date(),
    assignedTo: agent._id,
    status: 'pending',
  });

  await SiteVisit.create({
    organizationId: org._id,
    leadId: lead._id,
    propertyId: properties[0]._id,
    agentId: agent._id,
    date: new Date(),
    time: '15:00',
    location: 'DHA Phase 6',
    status: 'Scheduled',
  });

  await Deal.create({
    organizationId: org._id,
    leadId: lead._id,
    propertyId: properties[1]._id,
    agentId: agent._id,
    salePrice: 48000000,
    commissionPercent: 2,
    commissionAmount: 960000,
    agentSharePercent: 40,
    agentCommission: 384000,
    companyCommission: 576000,
    dealDate: new Date(),
    status: 'open',
    paymentStatus: 'pending',
  });

  await Lead.insertMany([
    {
      organizationId: org._id,
      name: 'Sara Malik (Demo)',
      phone: '+923002223344',
      preferredArea: 'Clifton',
      propertyType: 'house',
      transactionType: 'sale',
      priority: 'WARM',
      status: 'Contacted',
      assignedTo: owner._id,
      isDemo: true,
    },
    {
      organizationId: org._id,
      name: 'Hamza Ali (Demo)',
      phone: '+923003334455',
      preferredArea: 'DHA',
      propertyType: 'flat',
      budget: 22000000,
      transactionType: 'sale',
      priority: 'HOT',
      status: 'Property Sent',
      assignedTo: owner._id,
      isDemo: true,
    },
  ]);

  const { ClientPresentation } = await import('../src/lib/db/models/ClientPresentation');
  await ClientPresentation.create({
    organizationId: org._id,
    leadId: lead._id,
    propertyIds: [properties[0]._id],
    agentId: owner._id,
    token: 'demo-presentation-seed-token',
    events: [
      { type: 'interested', propertyId: properties[0]._id, at: new Date() },
      { type: 'interested', propertyId: properties[0]._id, at: new Date() },
      { type: 'site_visit_request', propertyId: properties[0]._id, at: new Date() },
    ],
  });

  await Activity.create({
    organizationId: org._id,
    leadId: lead._id,
    type: 'lead_created',
    summary: 'Demo lead created',
    createdBy: owner._id,
  });

  console.log('Demo seed complete.');
  console.log('Owner: owner@demo.estateflow.pk / Demo@12345');
  console.log('Agent: agent@demo.estateflow.pk / Demo@12345');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
