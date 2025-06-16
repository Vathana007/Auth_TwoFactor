import React, { useRef, useState } from 'react';
import DialogModal from './DialogModal';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import TextInput from './TextInput';
import axios from 'axios';

export default function ConfirmsPassword({
    title = 'Confirm Password',
    content = 'For your security, please confirm your password to continue.',
    button = 'Confirm',
    onConfirmed,
    children,
}) {
    const [confirmingPassword, setConfirmingPassword] = useState(false);
    const [form, setForm] = useState({
        password: '',
        error: '',
        processing: false,
    });
    const passwordInput = useRef(null);

    const startConfirmingPassword = () => {
        axios.get(route('password.confirmation')).then(response => {
            if (response.data.confirmed) {
                onConfirmed && onConfirmed();
            } else {
                setConfirmingPassword(true);
                setTimeout(() => passwordInput.current && passwordInput.current.focus(), 250);
            }
        });
    };

    const confirmPassword = () => {
        setForm(f => ({ ...f, processing: true }));
        axios.post(route('password.confirm'), {
            password: form.password,
        }).then(() => {
            setForm(f => ({ ...f, processing: false }));
            closeModal();
            setTimeout(() => onConfirmed && onConfirmed(), 0);
        }).catch(error => {
            setForm(f => ({
                ...f,
                processing: false,
                error: error.response?.data?.errors?.password?.[0] || 'Password confirmation failed.',
            }));
            passwordInput.current && passwordInput.current.focus();
        });
    };

    const closeModal = () => {
        setConfirmingPassword(false);
        setForm({ password: '', error: '', processing: false });
    };

    return (
        <span>
            <span onClick={startConfirmingPassword} style={{ cursor: 'pointer' }}>
                {children}
            </span>

            <DialogModal show={confirmingPassword} onClose={closeModal}>
                {{
                    title: <>{title}</>,
                    content: (
                        <>
                            {content}
                            <div className="mt-4">
                                <TextInput
                                    ref={passwordInput}
                                    type="password"
                                    className="mt-1 block w-3/4"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    onKeyUp={e => e.key === 'Enter' && confirmPassword()}
                                />
                                <InputError message={form.error} className="mt-2" />
                            </div>
                        </>
                    ),
                    footer: (
                        <>
                            <SecondaryButton onClick={closeModal}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                className="ms-3"
                                style={{ opacity: form.processing ? 0.25 : 1 }}
                                disabled={form.processing}
                                onClick={confirmPassword}
                            >
                                {button}
                            </PrimaryButton>
                        </>
                    ),
                }}
            </DialogModal>
        </span>
    );
}