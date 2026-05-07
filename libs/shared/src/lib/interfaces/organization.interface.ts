import { ProblemCategory } from '../enums/problem-category.enum';

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  contactEmail: string;
  categories: ProblemCategory[];
  createdAt: Date;
  updatedAt: Date;
}
