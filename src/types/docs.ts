export type DocumentComplexity = "simple" | "medium" | "complex";
export type DocumentStatus = "active" | "beta" | "coming-soon" | "deprecated";
export type UserRole = "user" | "premium" | "admin";

export interface DocumentPermissions {
  minRole?: UserRole;
  requiresAuth?: boolean;
  requiresSubscription?: boolean;
}

export interface DocumentStats {
  views?: number;
  downloads?: number;
  lastUsed?: Date;
  avgCompletionTime?: number; // in minutes
}

export interface DocumentCategory {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  order?: number;
  isExpanded?: boolean; // for collapsible sections
  badge?: {
    text: string;
    variant?: "info" | "warning" | "success" | "new";
  };
}

export interface DocumentAction {
  label: string;
  icon?: string;
  handler: string; // action identifier
  shortcut?: string;
}

export interface DocumentMeta {
  // Core identifiers
  id: string;
  label: string;
  title: string;
  titleEn?: string;

  // Classification
  category: string;
  subcategory?: string;
  tags?: string[];

  // Availability & status
  isAvailable: boolean;
  status: DocumentStatus;
  version?: string;
  releaseDate?: Date;
  lastUpdated?: Date;

  // Visuals
  icon: string;
  iconWeight?: "bold" | "regular" | "light" | "thin" | "duotone" | "fill";
  color?: string; // accent color for the document
  gradient?: string;

  // Metadata
  description?: string;
  descriptionEn?: string;
  complexity: DocumentComplexity;
  estimatedTime?: number; // in minutes

  // Badges & indicators
  badgeText?: string;
  badgeVariant?: "info" | "warning" | "success" | "danger" | "new" | "beta";

  // Permissions
  permissions?: DocumentPermissions;

  // Statistics
  stats?: DocumentStats;

  // Related documents
  relatedDocs?: string[];
  requiredDocs?: string[];

  // UI preferences
  order?: number;
  isPinned?: boolean;
  isFavorite?: boolean;

  // Custom actions
  actions?: DocumentAction[];

  // Keyboard shortcut
  shortcut?: string;

  // Analytics
  analyticsId?: string;
}
