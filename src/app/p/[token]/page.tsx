import Image from 'next/image';
import { connectDB } from '@/lib/db/mongoose';
import { ClientPresentation } from '@/lib/db/models/ClientPresentation';
import { Property } from '@/lib/db/models/Property';
import { Organization } from '@/lib/db/models/Organization';
import { User } from '@/lib/db/models/User';
import { formatCurrency } from '@/lib/utils';
import { PresentationClientActions } from '@/components/presentation/client-actions';
import { PresentationViewTracker } from '@/components/presentation/presentation-view-tracker';

export default async function PublicPresentationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectDB();
  const presentation = await ClientPresentation.findOne({ token }).lean();
  if (!presentation) {
    return <div className="p-8 text-center">Presentation not found</div>;
  }

  const [org, owner, properties] = await Promise.all([
    Organization.findById(presentation.organizationId).lean(),
    User.findById(presentation.agentId).lean(),
    Property.find({ _id: { $in: presentation.propertyIds } }).lean(),
  ]);

  const contactPhone = owner?.phone || org?.whatsapp || org?.phone;

  return (
    <div className="min-h-screen bg-slate-50">
      <PresentationViewTracker token={token} />
      <header className="border-b bg-white p-4">
        {org?.logoUrl && (
          <Image src={org.logoUrl} alt="" width={120} height={40} className="mb-2 h-10 w-auto object-contain" />
        )}
        <p className="text-xs uppercase tracking-wide text-teal-700">{org?.name ?? 'Real Estate'}</p>
        <h1 className="text-xl font-bold">Properties for you</h1>
        <p className="text-sm text-muted-foreground">
          {owner?.name ?? 'Owner'} · {contactPhone ? `Contact: ${contactPhone}` : ''}
        </p>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4 pb-12">
        {properties.map((property) => (
          <article key={property._id.toString()} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {property.images?.[0] && (
              <Image src={property.images[0]} alt={property.title} width={800} height={480} className="h-48 w-full object-cover" />
            )}
            <div className="space-y-2 p-4">
              <h2 className="text-lg font-semibold">{property.title}</h2>
              <p className="text-2xl font-bold text-teal-800">{formatCurrency(property.price)}</p>
              <p className="text-sm">{property.area || property.location} · {property.bedrooms} bed · {property.size} {property.sizeUnit}</p>
              <p className="text-sm text-slate-600">{property.description}</p>
              <PresentationClientActions token={token} propertyId={property._id.toString()} contactPhone={contactPhone} />
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
