import React, { useState, useRef } from 'react';
import axios from 'axios';
import DialogModal from './DialogModal';
import TextInput from './TextInput';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function ConfirmsPassword({ onConfirmed, children, title = 'Confirm Password', content = 'For your security, please confirm your password to continue.', button = 'Confirm' }) {
    const [showing, setShowing] = useState(false);
    const [form, setForm] = useState({ password: '', error: '', processing: false });
    const passwordInput = useRef(null);

    const start = () => {
        axios.get(route('password.confirmation')).then(res => {
            if (res.data.confirmed) {
                onConfirmed?.();
            } else {
                setShowing(true);
                setTimeout(() => passwordInput.current?.focus(), 250);
            }
        });
    };

    const confirm = () => {
        setForm(f => ({ ...f, processing: true }));
        axios.post(route('password.confirm'), { password: form.password }).then(() => {
            setForm({ password: '', error: '', processing: false });
            setShowing(false);
            onConfirmed?.();
        }).catch(err => {
            setForm(f => ({
                ...f,
                processing: false,
                error: err.response?.data?.errors?.password?.[0] || 'Password confirmation failed.',
            }));
            passwordInput.current?.focus();
        });
    };

    const close = () => {
        setShowing(false);
        setForm({ password: '', error: '', processing: false });
    };

    return (
        <>
            <span onClick={start} style={{ cursor: 'pointer' }}>
                {children}
            </span>

            <DialogModal show={showing} onClose={close}>
                {{
                    title: <>{title}</>,
                    content: (
                        <>
                            <p>{content}</p>
                            <div className="mt-4">
                                <TextInput
                                    ref={passwordInput}
                                    type="password"
                                    className="mt-1 block w-3/4"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                    onKeyUp={(e) => e.key === 'Enter' && confirm()}
                                />
                                <InputError message={form.error} className="mt-2" />
                            </div>
                        </>
                    ),
                    footer: (
                        <>
                            <SecondaryButton onClick={close}>Cancel</SecondaryButton>
                            <PrimaryButton
                                className="ms-3"
                                disabled={form.processing}
                                onClick={confirm}
                            >
                                {form.processing ? 'Confirming…' : button}
                            </PrimaryButton>
                        </>
                    ),
                }}
            </DialogModal>
        </>
    );
}
