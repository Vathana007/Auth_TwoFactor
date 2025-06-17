import { Head } from '@inertiajs/react';
import { useForm, Link, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';

export default function UsersCreateEdit({ user = {}, roles = [] }) {
    const isEdit = !!user.id;
    const { data, setData, post, patch, errors, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        roles: user.roles ? user.roles.map(role => role.name) : [],
    });

    const handleSelectRole = (e) => {
        const selected = Array.from(e.target.selectedOptions).map(option => option.value);
        setData('roles', selected);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('users.update', user.id));
        } else {
            post(route('users.store'));
        }
    };
    const headWeb = 'User List'
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <>
            <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />} >
                <Head title={headWeb} />
                <div className="container mt-4">
                    <div className="card">
                        <div className="card-header">
                            <h3>{isEdit ? 'Edit User' : 'Create User'}</h3>
                        </div>
                        <form onSubmit={submit}>
                            <div className="card-body">
                                {/* Name */}
                                <div className="form-group mb-3">
                                    <label htmlFor="name">
                                        <span className="text-danger">*</span> Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="email">
                                        <span className="text-danger">*</span> Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                {/* Password (only for create or if editing and want to change) */}
                                {!isEdit && (
                                    <div className="form-group mb-3">
                                        <label htmlFor="password">
                                            <span className="text-danger">*</span> Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            required />
                                        <InputError className="mt-2" message={errors.password} />
                                    </div>
                                )}
                                {isEdit && (
                                    <div className="form-group mb-3">
                                        <label htmlFor="password">
                                            Password <small>(leave blank to keep current)</small>
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)} />
                                        <InputError className="mt-2" message={errors.password} />
                                    </div>
                                )}

                                {/* Roles */}
                                <div className="form-group mb-3">
                                    <label htmlFor="roles">
                                        <span className="text-danger">*</span> Roles
                                    </label>
                                    <select
                                        id="roles"
                                        name="roles"
                                        className={`form-control ${errors.roles ? 'is-invalid' : ''}`}
                                        multiple
                                        value={data.roles}
                                        onChange={handleSelectRole}
                                        required
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={errors.roles} />
                                </div>
                            </div>
                            <div className="card-footer">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={processing}
                                >
                                    {processing
                                        ? isEdit
                                            ? 'Updating...'
                                            : 'Saving...'
                                        : isEdit
                                            ? 'Update'
                                            : 'Save'}
                                </button>
                                <Link href={route('users.index')} className="btn btn-secondary ms-2">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}