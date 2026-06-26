-- ════════════════════════════════════════════════════════════════
-- Chabua First Leaf — inventory decrement RPC
-- Run after products.sql. Idempotent (create or replace).
--
-- Atomically reduces stock for a set of line items. Each product row
-- is locked with FOR UPDATE, so two simultaneous checkouts of the last
-- tin are serialized — the second sees the reduced count and cannot
-- oversell.
--
-- Returns a JSONB array of shortfalls (empty when everything decremented
-- cleanly). The caller logs / flags these for manual review rather than
-- failing an order the customer has already paid for.
-- ════════════════════════════════════════════════════════════════

create or replace function decrement_product_inventory(p_items jsonb)
returns jsonb
language plpgsql
as $$
declare
  item       jsonb;
  pid        text;
  qty        integer;
  available  integer;
  shortfalls jsonb := '[]'::jsonb;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    pid := item->>'id';
    qty := coalesce((item->>'quantity')::int, 0);

    if qty <= 0 then
      continue;
    end if;

    -- Lock this product row for the duration of the transaction.
    select inventory_count into available
    from products
    where id = pid
    for update;

    if available is null then
      shortfalls := shortfalls || jsonb_build_object(
        'id', pid, 'requested', qty, 'available', 0, 'reason', 'not_found'
      );
      continue;
    end if;

    if available >= qty then
      update products set inventory_count = inventory_count - qty where id = pid;
    else
      -- Take what's there, record the gap so an admin can reconcile.
      update products set inventory_count = 0 where id = pid;
      shortfalls := shortfalls || jsonb_build_object(
        'id', pid, 'requested', qty, 'available', available, 'reason', 'insufficient_stock'
      );
    end if;
  end loop;

  return shortfalls;
end;
$$;