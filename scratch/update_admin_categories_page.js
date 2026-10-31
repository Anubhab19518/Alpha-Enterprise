const fs = require('fs');

const catPagePath = 'd:/Projects/admin-dashboard/src/app/categories/page.tsx';
let content = fs.readFileSync(catPagePath, 'utf8');

// Add duplicate detection & helper functions if not present
if (!content.includes('function getCategoryPath(')) {
  const helperCode = `
// Helper to construct complete hierarchy path (e.g. "Women → Hoodies")
function getCategoryPath(cat: any, allCategories: any[]): string {
  if (!cat) return '';
  if (!cat.parentId) return cat.name;
  const parent = allCategories.find((c) => c.id === cat.parentId);
  if (!parent) return cat.name;
  return \`\${getCategoryPath(parent, allCategories)} → \${cat.name}\`;
}
`;
  content = helperCode + content;
}

// Add Duplicate Detection diagnostic alert block inside return statement before rootCategories.map
const targetAnchor = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>`;

const duplicateNoticeBlock = `
      {/* Duplicate Category Name Diagnostic Notice */}
      {(() => {
        const nameMap = new Map<string, any[]>();
        categories.forEach((c) => {
          const list = nameMap.get(c.name) || [];
          list.push(c);
          nameMap.set(c.name, list);
        });
        const duplicates = Array.from(nameMap.entries()).filter(([_, list]) => list.length > 1);

        if (duplicates.length === 0) return null;

        return (
          <div
            style={{
              marginBottom: '20px',
              padding: '16px 20px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              color: '#1E40AF',
              fontSize: '13px',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ℹ Diagnostic Check: Duplicate Category Names Detected ({duplicates.length})</span>
            </div>
            <div style={{ fontSize: '12px', color: '#1E3A8A' }}>
              The following category names exist under different parent hierarchies. Category IDs remain unique:
            </div>
            <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px', fontSize: '12px' }}>
              {duplicates.map(([name, list]) => (
                <li key={name} style={{ marginBottom: '4px' }}>
                  <strong>{name}</strong>: {list.map((item) => item.parentId ? getCategoryPath(item, categories) : \`\${item.name} (Root)\`).join(' vs ')}
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      ` + targetAnchor;

if (content.includes(targetAnchor) && !content.includes('Duplicate Category Name Diagnostic Notice')) {
  content = content.replace(targetAnchor, duplicateNoticeBlock);
}

// Update sub-category badges to show parent path
const oldChildBadge = `<span>{child.name}</span>`;
const newChildBadge = `<span title={getCategoryPath(child, categories)}>{getCategoryPath(child, categories)}</span>`;

if (content.includes(oldChildBadge)) {
  content = content.replace(oldChildBadge, newChildBadge);
}

fs.writeFileSync(catPagePath, content, 'utf8');
console.log("SUCCESS: Updated Admin Categories Page with Diagnostic Notice & Parent Path Badges!");
