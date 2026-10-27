export default function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="admin-badge admin-badge--published">Published</span>
  ) : (
    <span className="admin-badge admin-badge--draft">Draft</span>
  );
}
