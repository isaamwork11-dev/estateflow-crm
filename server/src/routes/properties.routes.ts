import { Router } from 'express';
import { PropertyModel } from '../models/Property.js';
import { createProperty, findPropertyById } from '../repositories/propertyRepository.js';
import { services } from '../services/createServices.js';
import { PropertyLeadMatchingService } from '../services/PropertyLeadMatchingService.js';

export const propertiesRouter = Router();

propertiesRouter.get('/:id', async (req, res) => {
  const property = await findPropertyById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Not found' });
  res.json(property);
});

propertiesRouter.post('/', async (req, res) => {
  try {
    const body = req.body ?? {};
    const property = await createProperty({
      title: body.title,
      propertyType: String(body.propertyType ?? 'flat').toLowerCase(),
      purpose: body.purpose === 'rent' ? 'rent' : 'sale',
      city: body.city,
      area: body.area,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      price: Number(body.price),
      areaSize: body.areaSize,
      areaUnit: body.areaUnit,
      description: body.description,
      status: body.status ?? 'available',
      brokerId: body.brokerId,
    });

    const matches = await services.propertyLeadMatching.matchPropertyWithLeads(property._id.toString());
    res.status(201).json({ property, matchingLeads: matches });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid request' });
  }
});

propertiesRouter.post('/:id/match-leads', async (req, res) => {
  const matcher = new PropertyLeadMatchingService();
  const matches = await matcher.matchPropertyWithLeads(req.params.id);
  res.json({ propertyId: req.params.id, matches });
});

propertiesRouter.patch('/:id/status', async (req, res) => {
  const property = await findPropertyById(req.params.id);
  if (!property) return res.status(404).json({ error: 'Not found' });

  const status = req.body?.status;
  if (!['available', 'sold', 'rented', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }

  const updated = await PropertyModel.findByIdAndUpdate(
    property._id,
    { status },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Not found' });

  let matchingLeads: Awaited<ReturnType<PropertyLeadMatchingService['matchPropertyWithLeads']>> = [];
  if (status === 'available') {
    matchingLeads = await services.propertyLeadMatching.matchPropertyWithLeads(updated._id.toString());
  }

  res.json({ property: updated, matchingLeads });
});
