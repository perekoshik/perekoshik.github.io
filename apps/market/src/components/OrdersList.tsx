import { Link } from 'react-router-dom';
import type { OrderRecord } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

export function OrdersList({ orders }: { orders: OrderRecord[] }) {
  if (!orders.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-txt/70">
        Тут пока пусто — оформите заказ, и он появится в списке.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article key={order.id} className="glass rounded-3xl p-4 text-sm text-txt/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold text-txt">{order.itemId}</div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-txt/60">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <div className="mt-2 grid gap-2 text-xs text-txt/60 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-txt">Цена</p>
              <p>{order.price} TON</p>
            </div>
            <div>
              <p className="font-semibold text-txt">Дата</p>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-semibold text-txt">Адрес доставки</p>
              <p className="break-words">{order.deliveryAddress}</p>
            </div>
            <div>
              <p className="font-semibold text-txt">Магазин</p>
              <p className="break-words">{order.shopAddress}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-txt/60">
            <Link
              to={`/item/${encodeURIComponent(order.itemId)}`}
              className="rounded-2xl border border-white/10 px-3 py-1 text-txt transition-colors duration-150 hover:border-white/30"
            >
              Открыть карточку
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
