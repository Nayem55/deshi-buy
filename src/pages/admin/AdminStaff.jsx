import { useEffect, useState } from 'react';
import { adminAPI } from './AdminLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full access to every admin feature and staff access.' },
  { value: 'store_manager', label: 'Store Manager', description: 'Products, categories, brands, orders, uploads, and dashboard.' },
  { value: 'ad_manager', label: 'Ad Manager', description: 'Google Analytics and Facebook Pixel settings only.' },
];

const roleName = (role) => roles.find((item) => item.value === role)?.label || 'Admin';

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'store_manager' });

  const loadStaff = async () => {
    try {
      const response = await adminAPI.get('/admin/staff');
      setStaff(response.data.staff || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not load staff accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const createStaff = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await adminAPI.post('/admin/staff', form);
      setStaff((current) => [response.data.staff, ...current]);
      setForm({ name: '', email: '', password: '', role: 'store_manager' });
      toast.success('Staff account created.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not create staff account.');
    } finally {
      setSaving(false);
    }
  };

  const updateStaff = async (member, update) => {
    try {
      const response = await adminAPI.patch(`/admin/staff/${member._id}`, update);
      setStaff((current) => current.map((item) => item._id === member._id ? response.data.staff : item));
      toast.success('Staff access updated.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not update staff access.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading staff access..." />;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-charcoal">Staff Access</h1>
        <p className="mt-1 text-sm text-charcoal/60">Create admin accounts and give each person only the access they need.</p>
      </div>

      <form onSubmit={createStaff} className="bg-white border border-line rounded-lg p-6">
        <h2 className="font-semibold text-sm tracking-wider uppercase">Add Staff Member</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <label className="text-xs uppercase tracking-wider text-charcoal/60">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full border border-line px-4 py-3 text-sm focus:border-oxblood focus:outline-none normal-case tracking-normal text-charcoal" /></label>
          <label className="text-xs uppercase tracking-wider text-charcoal/60">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full border border-line px-4 py-3 text-sm focus:border-oxblood focus:outline-none normal-case tracking-normal text-charcoal" /></label>
          <label className="text-xs uppercase tracking-wider text-charcoal/60">Temporary Password<input required minLength="8" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-1.5 w-full border border-line px-4 py-3 text-sm focus:border-oxblood focus:outline-none normal-case tracking-normal text-charcoal" /></label>
          <label className="text-xs uppercase tracking-wider text-charcoal/60">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1.5 w-full border border-line px-4 py-3 text-sm focus:border-oxblood focus:outline-none normal-case tracking-normal text-charcoal">{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
        </div>
        <p className="mt-3 text-xs text-charcoal/50">{roles.find((role) => role.value === form.role)?.description}</p>
        <div className="mt-5 flex justify-end"><button disabled={saving} className="bg-oxblood text-white px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-oxblood-dark disabled:opacity-50">{saving ? 'Creating...' : 'Create Staff Account'}</button></div>
      </form>

      <section className="bg-white border border-line rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-line"><h2 className="font-semibold text-sm tracking-wider uppercase">Current Staff</h2></div>
        <div className="divide-y divide-line">
          {staff.map((member) => <div key={member._id} className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><p className="font-medium text-sm text-charcoal">{member.name}</p><p className="text-xs text-charcoal/55 mt-1">{member.email}</p></div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={member.role || 'admin'} onChange={(event) => updateStaff(member, { role: event.target.value })} className="border border-line px-3 py-2 text-sm focus:border-oxblood focus:outline-none">{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select>
              <button onClick={() => updateStaff(member, { active: member.active === false })} className={`px-3 py-2 text-xs uppercase tracking-wider rounded border ${member.active === false ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-red-200 text-red-700 hover:bg-red-50'}`}>{member.active === false ? 'Activate' : 'Deactivate'}</button>
              <span className={`text-xs font-medium ${member.active === false ? 'text-red-600' : 'text-emerald-600'}`}>{member.active === false ? 'Inactive' : 'Active'}</span>
            </div>
          </div>)}
          {!staff.length && <p className="px-6 py-8 text-sm text-charcoal/55">No staff accounts yet.</p>}
        </div>
      </section>
    </div>
  );
}
