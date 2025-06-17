import React, { useEffect, useMemo, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmsPassword from '@/Components/ConfirmsPassword';

export default function TwoFactorAuthenticationForm() {
    const page = usePage();
    const [qrCode, setQrCode] = useState(null);
    const [setupKey, setSetupKey] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [confirming, setConfirming] = useState(false);
    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);

    const confirmationForm = useForm({ code: '' });

    const twoFactorEnabled = useMemo(
        () => !enabling && page.props.auth.user?.two_factor_enabled,
        [enabling, page.props.auth.user?.two_factor_enabled]
    );

    useEffect(() => {
        if (confirming && !qrCode) {
            console.log('useEffect: confirming && !qrCode, fetching QR...');
            fetchQrAndKey();
        }
    }, [confirming, qrCode]);

    useEffect(() => {
        if (twoFactorEnabled && !qrCode) {
            console.log('useEffect: twoFactorEnabled && !qrCode, fetching QR...');
            fetchQrAndKey();
        }
    }, [twoFactorEnabled, qrCode]);

    const fetchQrAndKey = async () => {
        try {
            console.log('Fetching QR and setup key...');
            const res = await axios.get(route('two-factor.qr-code'));
            console.log('QR response:', res.data);
            setQrCode(res.data.svg || res.data.qr_code || null);
            setSetupKey(res.data.secret || res.data.setup_key || null);
        } catch (e) {
            console.error('Fetch QR error:', e);
            setQrCode(null);
            setSetupKey(null);
        }
    };

    const fetchRecoveryCodes = async () => {
        try {
            console.log('Fetching recovery codes...');
            const res = await axios.get(route('two-factor.recovery-codes'));
            console.log('Recovery codes response:', res.data);
            setRecoveryCodes(res.data || []);
        } catch (e) {
            console.error('Fetch recovery codes error:', e);
            setRecoveryCodes([]);
        }
    };

    const enableTwoFactorAuthentication = async () => {
        setEnabling(true);
        try {
            console.log('Enabling 2FA...');
            await axios.post(route('two-factor.enable'));
            setConfirming(true);
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
            console.log('2FA enabled, fetching QR and key...');
            fetchQrAndKey();
        } catch (e) {
            console.error('Enable 2FA error:', e);
        }
        setEnabling(false);
    };

    const confirmTwoFactorAuthentication = async (e) => {
        e.preventDefault();
        console.log('Confirming 2FA with code:', confirmationForm.data.code);
        confirmationForm.post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(false);
                setQrCode(null);
                setSetupKey(null);
                fetchRecoveryCodes();
                console.log('2FA confirmed!');
            },
            onError: (errors) => {
                console.error('Confirm 2FA error:', errors);
            }
        });
    };

    const regenerateRecoveryCodes = async () => {
        try {
            console.log('Regenerating recovery codes...');
            await axios.post(route('two-factor.recovery-codes.regenerate'));
            fetchRecoveryCodes();
        } catch (e) {
            console.error('Regenerate recovery codes error:', e);
        }
    };

    const disableTwoFactorAuthentication = async () => {
        setDisabling(true);
        try {
            console.log('Disabling 2FA...');
            await axios.delete(route('two-factor.disable'));
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
            setConfirming(false);
            console.log('2FA disabled.');
        } catch (e) {
            console.error('Disable 2FA error:', e);
        }
        setDisabling(false);
    };

    const cancelConfirmation = () => {
        console.log('Cancelling confirmation...');
        setConfirming(false);
        setQrCode(null);
        setSetupKey(null);
        setRecoveryCodes([]);
        confirmationForm.reset();
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Two Factor Authentication</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Add additional security to your account using two factor authentication.
                </p>
            </header>

            <div className="mt-5">
                {twoFactorEnabled ? (
                    <>
                        <p className="text-sm text-gray-600">
                            Two factor authentication is enabled on your account.
                        </p>
                        <div className="mt-4">
                            <SecondaryButton
                                onClick={fetchRecoveryCodes}
                                className="me-2"
                            >
                                Show Recovery Codes
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={regenerateRecoveryCodes}
                                className="me-2"
                            >
                                Regenerate Recovery Codes
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={disableTwoFactorAuthentication}
                                disabled={disabling}
                            >
                                {disabling ? 'Disabling...' : 'Disable'}
                            </SecondaryButton>
                        </div>
                        {qrCode && (
                            <div className="mt-4">
                                <div className="mb-2 font-semibold">Scan this QR code with your authenticator app:</div>
                                <div
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />
                                {setupKey && (
                                    <div className="mt-2">
                                        <span className="font-semibold">Setup Key:</span> {setupKey}
                                    </div>
                                )}
                            </div>
                        )}
                        {recoveryCodes.length > 0 && (
                            <div className="mt-4">
                                <div className="mb-2 font-semibold">Recovery Codes:</div>
                                <ul className="list-disc pl-5">
                                    {recoveryCodes.map((code, idx) => (
                                        <li key={idx}>{code}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <ConfirmsPassword onConfirmed={enableTwoFactorAuthentication}>
                        <PrimaryButton disabled={enabling}>
                            {enabling ? 'Enabling...' : 'Enable Two Factor Authentication'}
                        </PrimaryButton>
                    </ConfirmsPassword>
                )}
            </div>

            {confirming && (
                <form onSubmit={confirmTwoFactorAuthentication} className="mt-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Enter the OTP code from your authenticator app
                        </label>
                        <input
                            id="code"
                            type="text"
                            value={confirmationForm.data.code}
                            onChange={e => confirmationForm.setData('code', e.target.value)}
                            className="mt-1 block w-1/2 rounded border-gray-300"
                            autoFocus
                            required
                        />
                        {confirmationForm.errors.code && (
                            <div className="text-red-600 text-sm mt-1">{confirmationForm.errors.code}</div>
                        )}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <PrimaryButton type="submit" disabled={confirmationForm.processing}>
                            Confirm
                        </PrimaryButton>
                        <SecondaryButton type="button" onClick={cancelConfirmation}>
                            Cancel
                        </SecondaryButton>
                    </div>
                    {qrCode && (
                        <div className="mt-4">
                            <div className="mb-2 font-semibold">Scan this QR code with your authenticator app:</div>
                            <div
                                dangerouslySetInnerHTML={{ __html: qrCode }}
                            />
                            {setupKey && (
                                <div className="mt-2">
                                    <span className="font-semibold">Setup Key:</span> {setupKey}
                                </div>
                            )}
                        </div>
                    )}
                </form>
            )}
        </section >
    );
}