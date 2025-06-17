import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import ActionSection from '@/Components/ActionSection';
import ConfirmsPassword from '@/Components/ConfirmsPassword';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function TwoFactorAuthenticationForm({ requiresConfirmation }) {
    const page = usePage();
    const [enabling, setEnabling] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [setupKey, setSetupKey] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);

    const confirmationForm = useForm({
        code: '',
    });

    const twoFactorEnabled = useMemo(
        () => !enabling && page.props.auth.user?.two_factor_enabled,
        [enabling, page.props.auth.user?.two_factor_enabled]
    );

    useEffect(() => {
        if (!twoFactorEnabled) {
            confirmationForm.reset();
            confirmationForm.clearErrors && confirmationForm.clearErrors();
        }
    }, [twoFactorEnabled]);

    const enableTwoFactorAuthentication = () => {
        setEnabling(true);

        axios.post(route('two-factor.enable'))
            .then(() => Promise.all([
                showQrCode(),
                showSetupKey(),
                showRecoveryCodes(),
            ]))
            .finally(() => {
                setEnabling(false);
                setConfirming(requiresConfirmation);
            });
    };

    const showQrCode = () => {
        return axios.get(route('two-factor.qr-code')).then(response => {
            setQrCode(response.data.svg);
        });
    };

    const showSetupKey = () => {
        return axios.get(route('two-factor.secret-key')).then(response => {
            setSetupKey(response.data.secretKey);
        });
    };

    const showRecoveryCodes = () => {
        return axios.get(route('two-factor.recovery-codes')).then(response => {
            setRecoveryCodes(response.data);
        });
    };

    const confirmTwoFactorAuthentication = () => {
        confirmationForm.post(route('two-factor.confirm'), {
            errorBag: "confirmTwoFactorAuthentication",
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setConfirming(false);
                setQrCode(null);
                setSetupKey(null);
            },
        });
    };

    const regenerateRecoveryCodes = () => {
        axios.post(route('two-factor.recovery-codes')).then(() => showRecoveryCodes());
    };

    const disableTwoFactorAuthentication = () => {
        setDisabling(true);

        axios.delete(route('two-factor.disable'))
            .then(() => {
                setDisabling(false);
                setConfirming(false);
            });
    };

    return (
        <ActionSection
            title="Two Factor Authentication"
            description="Add additional security to your account using two factor authentication."
        >
            <div>
                {twoFactorEnabled && !confirming && (
                    <h3 className="text-lg font-medium text-gray-900">
                        You have enabled two factor authentication.
                    </h3>
                )}
                {twoFactorEnabled && confirming && (
                    <h3 className="text-lg font-medium text-gray-900">
                        Finish enabling two factor authentication.
                    </h3>
                )}
                {!twoFactorEnabled && (
                    <h3 className="text-lg font-medium text-gray-900">
                        You have not enabled two factor authentication.
                    </h3>
                )}

                <div className="mt-3 max-w-xl text-sm text-gray-600">
                    <p>
                        When two factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
                    </p>
                </div>

                {twoFactorEnabled && (
                    <>
                        {qrCode && (
                            <>
                                <div className="mt-4 max-w-xl text-sm text-gray-600">
                                    {confirming ? (
                                        <p className="font-semibold">
                                            To finish enabling two factor authentication, scan the following QR code using your phone's authenticator application or enter the setup key and provide the generated OTP code.
                                        </p>
                                    ) : (
                                        <p>
                                            Two factor authentication is now enabled. Scan the following QR code using your phone's authenticator application or enter the setup key.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 p-2 inline-block bg-white" dangerouslySetInnerHTML={{ __html: qrCode }} />

                                {setupKey && (
                                    <div className="mt-4 max-w-xl text-sm text-gray-600">
                                        <p className="font-semibold">
                                            Setup Key: <span dangerouslySetInnerHTML={{ __html: setupKey }} />
                                        </p>
                                    </div>
                                )}

                                {confirming && (
                                    <div className="mt-4">
                                        <InputLabel htmlFor="code" value="Code" />
                                        <TextInput
                                            id="code"
                                            value={confirmationForm.data.code}
                                            onChange={e => confirmationForm.setData('code', e.target.value)}
                                            type="text"
                                            name="code"
                                            className="block mt-1 w-1/2"
                                            inputMode="numeric"
                                            autoFocus
                                            autoComplete="one-time-code"
                                            onKeyUp={e => e.key === 'Enter' && confirmTwoFactorAuthentication()}
                                        />
                                        <InputError message={confirmationForm.errors.code} className="mt-2" />
                                    </div>
                                )}
                            </>
                        )}

                        {recoveryCodes.length > 0 && !confirming && (
                            <div>
                                <div className="mt-4 max-w-xl text-sm text-gray-600">
                                    <p className="font-semibold">
                                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two factor authentication device is lost.
                                    </p>
                                </div>
                                <div className="grid gap-1 max-w-xl mt-4 px-4 py-4 font-mono text-sm bg-gray-100 rounded-lg">
                                    {recoveryCodes.map(code => (
                                        <div key={code}>{code}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-5">
                    {!twoFactorEnabled ? (
                        <ConfirmsPassword onConfirmed={enableTwoFactorAuthentication}>
                            <PrimaryButton
                                type="button"
                                className={enabling ? 'opacity-25' : ''}
                                disabled={enabling}
                            >
                                Enable
                            </PrimaryButton>
                        </ConfirmsPassword>
                    ) : (
                        <>
                            <ConfirmsPassword onConfirmed={confirmTwoFactorAuthentication}>
                                {confirming && (
                                    <PrimaryButton
                                        type="button"
                                        className={`me-3${enabling ? ' opacity-25' : ''}`}
                                        disabled={enabling}
                                    >
                                        Confirm
                                    </PrimaryButton>
                                )}
                            </ConfirmsPassword>

                            <ConfirmsPassword onConfirmed={regenerateRecoveryCodes}>
                                {recoveryCodes.length > 0 && !confirming && (
                                    <SecondaryButton className="me-3">
                                        Regenerate Recovery Codes
                                    </SecondaryButton>
                                )}
                            </ConfirmsPassword>

                            <ConfirmsPassword onConfirmed={showRecoveryCodes}>
                                {recoveryCodes.length === 0 && !confirming && (
                                    <SecondaryButton className="me-3">
                                        Show Recovery Codes
                                    </SecondaryButton>
                                )}
                            </ConfirmsPassword>

                            <ConfirmsPassword onConfirmed={disableTwoFactorAuthentication}>
                                {confirming && (
                                    <SecondaryButton
                                        className={disabling ? 'opacity-25' : ''}
                                        disabled={disabling}
                                    >
                                        Cancel
                                    </SecondaryButton>
                                )}
                            </ConfirmsPassword>

                            <ConfirmsPassword onConfirmed={disableTwoFactorAuthentication}>
                                {!confirming && (
                                    <DangerButton
                                        className={disabling ? 'opacity-25' : ''}
                                        disabled={disabling}
                                    >
                                        Disable
                                    </DangerButton>
                                )}
                            </ConfirmsPassword>
                        </>
                    )}
                </div>
            </div>
        </ActionSection>
    );
}