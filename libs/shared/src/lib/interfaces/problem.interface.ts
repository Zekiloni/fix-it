import { ProblemCategory } from '../enums/problem-category.enum';
import { ProblemStatus } from '../enums/problem-status.enum';
import { IAttachment } from './attachment.interface';
import { GeoPoint } from './geo-point.interface';

export interface IProblem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  status: ProblemStatus;
  location: GeoPoint;
  address?: string;
  contactPhone?: string;
  attachments: IAttachment[];
  tags: string[];
  authorId: string;
  organizationId?: string;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
