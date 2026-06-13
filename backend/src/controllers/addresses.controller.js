import { supabase } from '../config/supabase.js';

/**
 * All handlers here run behind `requireAuth` — req.user is guaranteed.
 * Every query is scoped to req.user.id so customers can never read or
 * modify another customer's addresses, even though we're using the
 * service-role client (RLS is a backstop, not the only guard).
 */

const REQUIRED_FIELDS = ['name', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];

function validateAddressBody(body) {
  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || !String(body[field]).trim()) {
      return `${field} is required.`;
    }
  }
  return null;
}

function toDbRow(body, userId) {
  return {
    user_id: userId,
    label: body.label?.trim() || null,
    name: body.name.trim(),
    phone: body.phone.trim(),
    address: body.address.trim(),
    city: body.city.trim(),
    state: body.state.trim(),
    postal_code: body.postalCode.trim(),
    country: body.country.trim(),
  };
}

function toApiShape(row) {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

/* ─── GET /api/addresses ─────────────────────────────────────── */
export const listAddresses = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, addresses: (data || []).map(toApiShape) });
  } catch (error) {
    next(error);
  }
};

/* ─── POST /api/addresses ────────────────────────────────────── */
export const createAddress = async (req, res, next) => {
  try {
    const validationError = validateAddressBody(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    // If this is the user's first address, make it the default automatically
    const { count } = await supabase
      .from('addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    const row = toDbRow(req.body, req.user.id);
    if (!count || count === 0) row.is_default = true;

    const { data, error } = await supabase
      .from('addresses')
      .insert([row])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, address: toApiShape(data) });
  } catch (error) {
    next(error);
  }
};

/* ─── PATCH /api/addresses/:id ───────────────────────────────── */
export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const validationError = validateAddressBody(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const row = toDbRow(req.body, req.user.id);
    delete row.user_id; // never allow reassigning ownership

    const { data, error } = await supabase
      .from('addresses')
      .update(row)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Address not found.' });
    }

    return res.status(200).json({ success: true, address: toApiShape(data) });
  } catch (error) {
    next(error);
  }
};

/* ─── DELETE /api/addresses/:id ──────────────────────────────── */
export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing } = await supabase
      .from('addresses')
      .select('id, is_default')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Address not found.' });
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    // If the deleted address was the default, promote the most recent remaining one
    if (existing.is_default) {
      const { data: remaining } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (remaining) {
        await supabase.from('addresses').update({ is_default: true }).eq('id', remaining.id);
      }
    }

    return res.status(200).json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
};

/* ─── POST /api/addresses/:id/default ────────────────────────── */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Unset any existing default for this user, then set the new one.
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', req.user.id)
      .eq('is_default', true);

    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Address not found.' });
    }

    return res.status(200).json({ success: true, address: toApiShape(data) });
  } catch (error) {
    next(error);
  }
};