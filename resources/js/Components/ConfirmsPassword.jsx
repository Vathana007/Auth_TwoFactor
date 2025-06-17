import React, { useRef, useState } from 'react';
import DialogModal from './DialogModal';
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import axios from 'axios';

export default function ConfirmsPassword({
    onConfirmed,
    children,
    title = 'Confirm Password',
    content = 'For your security, please confirm your password to continue.',
    button = 'Confirm',
}) {
    const [showing, setShowing] = useState(false);
    const [form, setForm] = useState({ password: '', error: '', processing: false });
    const passwordInput = useRef(null);

    const start = (e) => {
        e.preventDefault();
        setShowing(true);
        setForm({ password: '', error: '', processing: false });
        setTimeout(() => passwordInput.current?.focus(), 250);
    };

    const confirm = async (e) => {
        e.preventDefault();
        setForm(f => ({ ...f, processing: true, error: '' }));
        try {
            await axios.post(route('password.confirm'), { password: form.password });
            setShowing(false);
            setForm({ password: '', error: '', processing: false });
            onConfirmed();
        } catch (error) {
            setForm(f => ({
                ...f,
                error: error.response?.data?.errors?.password?.[0] || 'Password incorrect',
                processing: false,
            }));
            passwordInput.current?.focus();
        }
    };

    const close = () => setShowing(false);

    return (
        <>
            <span onClick={start}>
                {children}
            </span>
            <DialogModal show={showing} onClose={close}>
                {{
                    title,
                    content: (
                        <form onSubmit={confirm}>
                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    ref={passwordInput}
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="mt-1 block w-3/4"
                                    autoComplete="current-password"
                                />
                                <InputError message={form.error} className="mt-2" />
                            </div>
                        </form>
                    ),
                    footer: (
                        <div className="flex gap-2">
                            <SecondaryButton type="button" onClick={close}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton onClick={confirm} disabled={form.processing}>
                                {button}
                            </PrimaryButton>
                        </div>
                    ),
                }}
            </DialogModal>
        </>
    );
}