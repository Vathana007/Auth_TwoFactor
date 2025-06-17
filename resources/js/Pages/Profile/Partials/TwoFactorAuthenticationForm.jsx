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

    const twoFactorEnabled = useMemo(
        () => !enabling && page.props.auth.user?.two_factor_enabled,
        [enabling, page.props.auth.user?.two_factor_enabled]
    );

    useEffect(() => {
        if (!twoFactorEnabled) {
            confirmationForm.reset();
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
        }
    }, [twoFactorEnabled]);

    // Fetch QR code and setup key
    const fetchQrAndKey = async () => {
        const qrRes = await axios.get(route('two-factor.qr-code'));
        setQrCode(qrRes.data.svg);
        const keyRes = await axios.get(route('two-factor.secret-key'));
        setSetupKey(keyRes.data.secretKey);
    };

    // Fetch recovery codes
    const fetchRecoveryCodes = async () => {
        const response = await axios.get(route('two-factor.recovery-codes'));
        setRecoveryCodes(response.data);
    };

    // Enable 2FA after password confirmation
    const enableTwoFactorAuthentication = () => {
        setEnabling(true);
        axios.post(route('two-factor.enable')).then(() => {
            fetchQrAndKey();
            setConfirming(true);  // Now confirm the password first before enabling 2FA
        }).finally(() => setEnabling(false));
    };

    // Confirm 2FA with OTP code
    const confirmTwoFactorAuthentication = () => {
        confirmationForm.post(route('two-factor.confirm'), {
            errorBag: "confirmTwoFactorAuthentication",
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setConfirming(false);
                fetchRecoveryCodes();
            },
        });
    };

    // Regenerate recovery codes
    const regenerateRecoveryCodes = () => {
        axios.post(route('two-factor.recovery-codes')).then(() => fetchRecoveryCodes());
    };

    // Disable 2FA
    const disableTwoFactorAuthentication = () => {
        setDisabling(true);
        axios.delete(route('two-factor.disable')).then(() => {
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
            setConfirming(false);
        }).finally(() => setDisabling(false));
    };

    // Cancel confirmation step
    const cancelConfirmation = () => {
        setConfirming(false);
        setQrCode(null);
        setSetupKey(null);
        confirmationForm.reset();
    };

    return (
        <ActionSection title="Two Factor Authentication" description="Add additional security to your account using two-factor authentication.">
            <div>
                {!twoFactorEnabled && (
                    <h3 className="text-lg font-medium text-gray-900">You have not enabled two factor authentication.</h3>
                )}

                {twoFactorEnabled && !confirming && (
                    <h3 className="text-lg font-medium text-gray-900">You have enabled two factor authentication.</h3>
                )}

                {twoFactorEnabled && confirming && (
                    <h3 className="text-lg font-medium text-gray-900">Finish enabling two factor authentication.</h3>
                )}

                <div className="mt-3 max-w-xl text-sm text-gray-600">
                    <p>When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.</p>
                </div>

                {(twoFactorEnabled || confirming) && (
                    <>
                        {qrCode && (
                            <div className="mt-4">
                                <div className="max-w-xl text-sm text-gray-600">
                                    {confirming ? (
                                        <p className="font-semibold">To finish enabling two-factor authentication, scan the QR code below or enter the setup key and provide the generated OTP code.</p>
                                    ) : (
                                        <p>Two-factor authentication is now enabled. Scan the QR code or enter the setup key.</p>
                                    )}
                                </div>
                                <div className="mt-4 p-2 inline-block bg-white" dangerouslySetInnerHTML={{ __html: qrCode }} />
                                {setupKey && (
                                    <div className="mt-4 max-w-xl text-sm text-gray-600">
                                        <p className="font-semibold">Setup Key: <span>{setupKey}</span></p>
                                    </div>
                                )}

                                {confirming && (
                                    <div className="mt-4">
                                        <InputLabel htmlFor="code" value="Code" />
                                        <TextInput
                                            id="code"
                                            value={confirmationForm.data.code}
                                            onChange={(e) => confirmationForm.setData('code', e.target.value)}
                                            type="text"
                                            className="block mt-1 w-1/2"
                                            inputMode="numeric"
                                            autoFocus
                                            autoComplete="one-time-code"
                                            onKeyUp={(e) => e.key === 'Enter' && confirmTwoFactorAuthentication()}
                                        />
                                        <InputError message={confirmationForm.errors.code} className="mt-2" />
                                    </div>
                                )}
                            </div>
                        )}

                        {recoveryCodes.length > 0 && !confirming && (
                            <div className="mt-4">
                                <p className="font-semibold">Store these recovery codes in a secure password manager. They can be used to recover access to your account if your device is lost.</p>
                                <div className="grid gap-1 max-w-xl mt-4 px-4 py-4 font-mono text-sm bg-gray-100 rounded-lg">
                                    {recoveryCodes.map(code => (
                                        <div key={code}>{code}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                    {!twoFactorEnabled ? (
                        <ConfirmsPassword onConfirmed={enableTwoFactorAuthentication}>
                            <PrimaryButton type="button" className={enabling ? 'opacity-25' : ''} disabled={enabling}>Enable</PrimaryButton>
                        </ConfirmsPassword>
                    ) : (
                        <>
                            {confirming && (
                                <>
                                    <ConfirmsPassword onConfirmed={confirmTwoFactorAuthentication}>
                                        <PrimaryButton type="button" disabled={enabling}>Confirm</PrimaryButton>
                                    </ConfirmsPassword>
                                    <SecondaryButton onClick={cancelConfirmation} disabled={disabling}>Cancel</SecondaryButton>
                                </>
                            )}

                            {recoveryCodes.length > 0 && !confirming && (
                                <ConfirmsPassword onConfirmed={regenerateRecoveryCodes}>
                                    <SecondaryButton>Regenerate Recovery Codes</SecondaryButton>
                                </ConfirmsPassword>
                            )}

                            {!confirming && (
                                <ConfirmsPassword onConfirmed={disableTwoFactorAuthentication}>
                                    <DangerButton disabled={disabling}>Disable</DangerButton>
                                </ConfirmsPassword>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ActionSection>
    );
}
