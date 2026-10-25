import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Users, UserRoundPlus, Search, RefreshCw, Pencil, X, MapPin,
  BadgeCheck, BriefcaseBusiness, ArrowUpRight, CheckCircle2, AlertCircle,
  UserRound, Hash, LoaderCircle
} from 'lucide-react'
import { createEmployee, getApiError, getEmployees, updateEmployee } from './api/employeeApi'

const emptyForm = { name: '', employeeId: '', address: '' }

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'E'
}

function App() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    try {
      setEmployees(await getEmployees())
    } catch (error) {
      setNotice({ type: 'error', text: getApiError(error) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return employees
    return employees.filter((employee) =>
      [employee.name, employee.employeeId, employee.address]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    )
  }, [employees, search])

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const startEdit = (employee) => {
    setEditingId(employee.id)
    setForm({
      name: employee.name || '',
      employeeId: employee.employeeId || '',
      address: employee.address || '',
    })
    setFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      name: form.name.trim(),
      employeeId: form.employeeId.trim(),
      address: form.address.trim(),
    }
    if (!payload.name || !payload.employeeId || !payload.address) {
      setNotice({ type: 'error', text: 'Please complete all three fields.' })
      return
    }

    setSaving(true)
    try {
      if (editingId !== null) {
        await updateEmployee(editingId, payload)
        setNotice({ type: 'success', text: 'Employee details updated successfully.' })
      } else {
        await createEmployee(payload)
        setNotice({ type: 'success', text: 'Employee added successfully.' })
      }
      cancelForm()
      await loadEmployees()
    } catch (error) {
      setNotice({ type: 'error', text: getApiError(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="PeopleDesk home">
          <span className="brand-mark"><Users size={22} strokeWidth={2.4} /></span>
          <span>people<span className="brand-accent">desk</span><small>PEOPLE OPERATIONS</small></span>
        </a>

        <div className="nav-caption">WORKSPACE</div>
        <div className="nav-item active"><Users size={18} /><span>Employees</span><span className="nav-count">{employees.length}</span></div>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon"><BadgeCheck size={18} /></span>
            <strong>Your people, organized.</strong>
            <p>One simple space to manage your employee directory.</p>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">PD</div>
            <div><strong>Workspace admin</strong><small>Administrator</small></div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Employees</strong></div>
          <div className="topbar-right"><span className="status-dot" /> Local workspace <span className="topbar-divider" /><span className="today-label">Employee directory</span></div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> PEOPLE DIRECTORY</div>
              <h1>Employee <span>management</span></h1>
              <p className="subtitle">Keep your team’s details clear, current, and all in one place.</p>
            </div>
            <button className="button button-primary" onClick={startCreate}><UserRoundPlus size={17} /> Add employee</button>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon stat-icon-purple"><Users size={20} /></div>
              <div className="stat-label">Total employees</div>
              <div className="stat-bottom"><strong>{employees.length}</strong><span className="stat-note">in directory</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon-green"><BadgeCheck size={20} /></div>
              <div className="stat-label">Directory status</div>
              <div className="stat-bottom"><strong className="stat-word">Active</strong><span className="live-pill"><span /> Connected UI</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon stat-icon-blue"><BriefcaseBusiness size={20} /></div>
              <div className="stat-label">Quick actions</div>
              <div className="stat-bottom"><strong className="stat-word">Create & edit</strong><span className="stat-note">employee records</span></div>
            </article>
          </section>

          {notice && <div className={`notice ${notice.type}`} role="status">
            {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notice.text}</span><button className="notice-close" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={16} /></button>
          </div>}

          {formOpen && (
            <section className="form-card">
              <div className="form-heading">
                <div className="form-title-icon"><UserRoundPlus size={19} /></div>
                <div><h2>{editingId !== null ? 'Edit employee details' : 'Add a new employee'}</h2><p>{editingId !== null ? 'Make changes to this employee record.' : 'Enter the details below to add someone to your directory.'}</p></div>
                <button className="icon-button close-form" onClick={cancelForm} aria-label="Close form"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label className="field"><span>Full name <i>*</i></span><div className="input-wrap"><UserRound size={17} /><input autoFocus maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aditi Sharma" required /></div></label>
                  <label className="field"><span>Employee ID <i>*</i></span><div className="input-wrap"><Hash size={17} /><input maxLength={30} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. EMP-1024" required /></div><small>Must be unique for each employee.</small></label>
                  <label className="field field-full"><span>Address <i>*</i></span><div className="input-wrap input-wrap-top"><MapPin size={17} /><textarea maxLength={300} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, city, state" required /></div></label>
                </div>
                <div className="form-footer"><span className="required-note"><i>*</i> Required fields</span><div className="form-actions"><button type="button" className="button button-quiet" onClick={cancelForm}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <CheckCircle2 size={17} />}{saving ? 'Saving...' : editingId !== null ? 'Save changes' : 'Create employee'}</button></div></div>
              </form>
            </section>
          )}

          <section className="directory-card">
            <div className="directory-header">
              <div><div className="section-title-row"><h2>Team directory</h2><span className="count-pill">{filteredEmployees.length}</span></div><p>Browse and manage employee information.</p></div>
              <div className="directory-actions">
                <label className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." aria-label="Search employees" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label>
                <button className="icon-button refresh-button" onClick={loadEmployees} disabled={loading} aria-label="Refresh employees" title="Refresh list"><RefreshCw size={17} className={loading ? 'spin' : ''} /></button>
              </div>
            </div>

            <div className="table-scroll">
              <table>
                <thead><tr><th>EMPLOYEE</th><th>EMPLOYEE ID</th><th>ADDRESS</th><th className="actions-heading">ACTION</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="4"><div className="table-state"><LoaderCircle className="spin" size={22} /><span>Loading employee directory...</span></div></td></tr>
                    : filteredEmployees.length === 0 ? <tr><td colSpan="4"><div className="empty-state"><span className="empty-icon"><Users size={24} /></span><strong>{search ? 'No matching employees' : 'Your directory is ready'}</strong><p>{search ? 'Try a different name, employee ID, or address.' : 'Add your first employee to see the directory come to life.'}</p>{!search && <button className="button button-primary button-small" onClick={startCreate}><UserRoundPlus size={15} /> Add first employee</button>}</div></td></tr>
                    : filteredEmployees.map((employee) => <tr key={employee.id}>
                      <td><div className="employee-cell"><div className="employee-avatar">{initials(employee.name)}</div><div><strong>{employee.name}</strong><small>Employee record</small></div></div></td>
                      <td><span className="employee-id">{employee.employeeId}</span></td>
                      <td><div className="address-cell"><MapPin size={15} /><span>{employee.address}</span></div></td>
                      <td className="actions-cell"><button className="edit-button" onClick={() => startEdit(employee)}><Pencil size={14} /> Edit <ArrowUpRight size={13} /></button></td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <div className="directory-footer"><span>Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees</span><span className="secure-label"><BadgeCheck size={15} /> Employee records</span></div>
          </section>
          <footer className="page-footer"><span>PeopleDesk <span>·</span> Employee Management</span><span>Built with React & Spring Boot</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App
