import { IOrganization } from '@fix-it/shared';
import { OrganizationDocument } from '../schemas/organization.schema';

export const toOrganization = (doc: OrganizationDocument): IOrganization => ({
  id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  description: doc.description,
  contactEmail: doc.contactEmail,
  categories: doc.categories,
  createdAt: (doc as unknown as { createdAt: Date }).createdAt,
  updatedAt: (doc as unknown as { updatedAt: Date }).updatedAt,
});
