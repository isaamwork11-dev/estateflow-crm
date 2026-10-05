'use client';

import { recordPresentationEventAction } from '@/lib/actions/presentations';
import { Button } from '@/components/ui/button';

export function PresentationClientActions({
  token,
  propertyId,
  contactPhone,
}: {
  token: string;
  propertyId: string;
  contactPhone?: string | null;
}) {
  async function act(type: 'interested' | 'site_visit_request' | 'contact_agent') {
    await recordPresentationEventAction(token, type, propertyId);
    alert('Thank you! Our agent will contact you shortly.');
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <Button size="sm" onClick={() => act('interested')}>Interested</Button>
      <Button size="sm" variant="outline" onClick={() => act('site_visit_request')}>Request Site Visit</Button>
      {contactPhone && (
        <Button asChild size="sm" variant="outline">
          <a href={`tel:${contactPhone}`}>Contact Owner</a>
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => act('contact_agent')}>Message Owner</Button>
    </div>
  );
}
