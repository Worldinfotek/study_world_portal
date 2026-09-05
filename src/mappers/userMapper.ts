export function mapSqlUser(row: any) {
  const email = String(row?.email || '').trim().toLowerCase();
  return {
    id: row?.uid || `usr_${email.replace(/[^a-z0-9]+/g, '_')}`,
    email,
    name: row?.name || email.split('@')[0],
    role: row?.role || 'User',
    status: row?.status === 'Inactive' || row?.is_active === false || row?.is_active === 0 ? 'Inactive' : 'Active',
    export_permission: Boolean(row?.export_permission),
    department: row?.department || row?.franchise_name || 'Portal User',
    franchise_id: row?.franchise_id || undefined,
    franchise_name: row?.franchise_name || undefined,
    avatar_url: row?.photo_url || undefined,
    phone: row?.phone || undefined,
    auth_provider: row?.auth_provider || 'email',
    last_login: new Date().toISOString(),
  };
}

export function isInactiveUserRow(row: any): boolean {
  return row?.status === 'Inactive' || row?.is_active === false || row?.is_active === 0;
}
