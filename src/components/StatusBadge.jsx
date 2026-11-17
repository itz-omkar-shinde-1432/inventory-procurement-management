const CLASS = { 'In Stock': 'ok', 'Low Stock': 'warn', 'Out of Stock': 'bad' };
export default function StatusBadge({ status }) {
  return <span className={`badge ${CLASS[status]}`}>{status}</span>;
}
