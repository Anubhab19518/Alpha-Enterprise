import { Category } from '@/types/api';

export interface CategoryTreeNode extends Category {
  childrenNodes: CategoryTreeNode[];
}

/**
 * Constructs the complete hierarchy path string for a given category.
 * Example: "Women → Hoodies", "Men → Shoes", "Hoodies"
 */
export function getCategoryFullPath(
  category: Category | null | undefined,
  allCategories: Category[]
): string {
  if (!category) return '';
  if (!category.parentId) return category.name;
  const parent = allCategories.find((c) => c.id === category.parentId);
  if (!parent) return category.name;
  return `${getCategoryFullPath(parent, allCategories)} → ${category.name}`;
}

/**
 * Returns a clear display name for a category, adding parent context
 * if another category shares the exact same name (e.g., "Hoodies (Root)" vs "Women → Hoodies").
 */
export function getCategoryDisplayName(
  category: Category | null | undefined,
  allCategories: Category[]
): string {
  if (!category) return '';

  const sameNameCategories = allCategories.filter(
    (c) => c.name.toLowerCase() === category.name.toLowerCase()
  );

  if (sameNameCategories.length > 1) {
    if (category.parentId) {
      return getCategoryFullPath(category, allCategories);
    } else {
      return `${category.name} (Root)`;
    }
  }

  return category.name;
}

/**
 * Builds a hierarchical category tree from flat backend array response.
 * Preserves backend UUIDs and parentId relationships.
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const nodeMap = new Map<string, CategoryTreeNode>();

  categories.forEach((cat) => {
    nodeMap.set(cat.id, { ...cat, childrenNodes: [] });
  });

  const tree: CategoryTreeNode[] = [];

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.childrenNodes.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}
