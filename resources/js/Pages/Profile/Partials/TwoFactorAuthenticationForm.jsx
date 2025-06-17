import React, { useEffect, useState, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import ActionSection from '@/Components/ActionSection';
import ConfirmsPassword from '@/Components/ConfirmsPassword';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';

export default function TwoFactorAuthenticationForm() {
    const page = usePage();
    const [qrCode, setQrCode] = useState(null);
    const [setupKey, setSetupKey] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [confirming, setConfirming] = useState(false);
    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);

    const confirmationForm = useForm({ code: '' });

    // whether the user already had 2FA enabled on page‐load
    const twoFactorEnabled = useMemo(
        () => !enabling && page.props.auth.user?.two_factor_enabled,
        [enabling, page.props.auth.user?.two_factor_enabled]
    );

    // always reset local state if they ever disable or page refreshes
    useEffect(() => {
        if (!twoFactorEnabled && !confirming) {
            confirmationForm.reset();
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
        }
    }, [twoFactorEnabled, confirming]);

    // single fetch helper
    const fetchQrAndKey = async () => {
        const [{ data: qr }, { data: key }] = await Promise.all([
            axios.get(route('two-factor.qr-code')),
            axios.get(route('two-factor.secret-key')),
        ]);
        console.log('QR:', qr, 'KEY:', key);
        setQrCode(qr.svg);
        setSetupKey(key.secretKey);
    };

    const fetchRecoveryCodes = async () => {
        const { data } = await axios.get(route('two-factor.recovery-codes'));
        console.log('Recovery codes:', data);
        setRecoveryCodes(data);
    };

    // 1) enable → 2) fetch QR/Key → 3) show confirmation UI
    const enableTwoFactorAuthentication = async () => {
        setEnabling(true);
        try {
            console.log('Enabling 2FA…');
            await axios.post(route('two-factor.enable'));
            console.log('Fetching QR & Key…');
            await fetchQrAndKey();
            setConfirming(true);
        } catch (e) {
            console.error(e);
        } finally {
            setEnabling(false);
        }
    };

    // post OTP code
    const confirmTwoFactorAuthentication = (e) => {
        e.preventDefault();
        console.log('Confirming OTP:', confirmationForm.data.code);
        confirmationForm.post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('OTP confirmed!');
                setConfirming(false);
                fetchRecoveryCodes();
            },
            onError: (errors) => {
                console.error('Confirm error:', errors);
            },
        });
    };

    const regenerateRecoveryCodes = async () => {
        console.log('Regenerating codes…');
        await axios.post(route('two-factor.recovery-codes.regenerate'));
        fetchRecoveryCodes();
    };

    const disableTwoFactorAuthentication = async () => {
        setDisabling(true);
        try {
            console.log('Disabling 2FA…');
            await axios.delete(route('two-factor.disable'));
            setConfirming(false);
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
            console.log('Disabled.');
        } catch (e) {
            console.error(e);
        } finally {
            setDisabling(false);
        }
    };

    const cancelConfirmation = () => {
        console.log('Cancelled.');
        setConfirming(false);
        setQrCode(null);
        setSetupKey(null);
        confirmationForm.reset();
    };

    return (
        <ActionSection
            title="Two Factor Authentication"
            description="Add additional security to your account using two-factor authentication."
        >
            <div>
                {/* 1) not yet enabled & not confirming → show “Enable” */}
                {!twoFactorEnabled && !confirming && (
                    <ConfirmsPassword onConfirmed={enableTwoFactorAuthentication}>
                        <PrimaryButton disabled={enabling}>
                            {enabling ? 'Enabling…' : 'Enable Two-Factor Authentication'}
                        </PrimaryButton>
                    </ConfirmsPassword>
                )}

                {/* 2) confirming → show QR + OTP input */}
                {confirming && qrCode && (
                    <form onSubmit={confirmTwoFactorAuthentication} className="mt-6">
                        <p className="mb-4 text-sm text-gray-600">
                            Scan the QR code or enter the setup key, then paste the OTP below.
                        </p>
                        <div className="p-4 bg-white inline-block">
                            <div dangerouslySetInnerHTML={{ __html: qrCode }} />
                        </div>
                        {setupKey && <p className="mt-2 font-mono">{setupKey}</p>}
                        <div className="mt-4">
                            <InputLabel htmlFor="code" value="One-Time Password" />
                            <TextInput
                                id="code"
                                type="text"
                                value={confirmationForm.data.code}
                                onChange={e => confirmationForm.setData('code', e.target.value)}
                                autoComplete="one-time-code"
                                required
                            />
                            <InputError message={confirmationForm.errors.code} className="mt-1" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <PrimaryButton type="submit" disabled={confirmationForm.processing}>
                                Confirm
                            </PrimaryButton>
                            <SecondaryButton onClick={cancelConfirmation}>Cancel</SecondaryButton>
                        </div>
                    </form>
                )}

                {/* 3) already enabled & not confirming → show recovery codes & disable */}
                {twoFactorEnabled && !confirming && (
                    <>
                        <p className="text-sm text-gray-600">
                            Two-factor authentication is enabled on your account.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <SecondaryButton onClick={fetchRecoveryCodes}>
                                Show Recovery Codes
                            </SecondaryButton>
                            <SecondaryButton onClick={regenerateRecoveryCodes}>
                                Regenerate Codes
                            </SecondaryButton>
                            <SecondaryButton onClick={disableTwoFactorAuthentication} disabled={disabling}>
                                {disabling ? 'Disabling…' : 'Disable 2FA'}
                            </SecondaryButton>
                        </div>
                        {qrCode && (
                            <div className="mt-4">
                                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
                                {setupKey && <p className="mt-2 font-mono">{setupKey}</p>}
                            </div>
                        )}
                        {recoveryCodes.length > 0 && (
                            <ul className="mt-4 list-disc pl-5">
                                {recoveryCodes.map((c, i) => (
                                    <li key={i}>{c}</li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </ActionSection>
    );
}
