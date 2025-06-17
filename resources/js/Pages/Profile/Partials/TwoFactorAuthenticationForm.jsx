import { useState, useEffect, useMemo } from "react";
import { useForm, usePage } from "@inertiajs/react";
import axios from "axios";
import ActionSection from "@/Components/ActionSection";
import ConfirmsPassword from "@/Components/ConfirmsPassword";
import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";

export default function TwoFactorAuthenticationForm({ requiresConfirmation }) {
    const { props } = usePage();
    const user = props.auth.user;

    const [locallyEnabled, setLocallyEnabled] = useState(!!user.two_factor_enabled);
    const [enabling, setEnabling] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [setupKey, setSetupKey] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    const confirmationForm = useForm({ code: "" });

    const twoFactorEnabled = useMemo(
        () => locallyEnabled && !enabling,
        [locallyEnabled, enabling]
    );

    useEffect(() => {
        if (!twoFactorEnabled) {
            confirmationForm.reset();
            confirmationForm.clearErrors?.();
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
            setConfirming(false);
        }
    }, [twoFactorEnabled]);

    const fetchQrAndKey = async () => {
        const qrRes = await axios.get(route("two-factor.qr-code"));
        setQrCode(qrRes.data.svg);
        const keyRes = await axios.get(route("two-factor.secret-key"));
        setSetupKey(keyRes.data.secretKey);
    };

    const fetchRecoveryCodes = async () => {
        const response = await axios.get(route("two-factor.recovery-codes"));
        setRecoveryCodes(response.data);
    };

    const enableTwoFactorAuthentication = () => {
        setEnabling(true);
        axios
            .post(route("two-factor.enable"))
            .then(() => {
                setLocallyEnabled(true);
                fetchQrAndKey();
                if (requiresConfirmation) {
                    setConfirming(true); // Show password confirmation modal
                } else {
                    fetchRecoveryCodes(); // Fetch recovery codes immediately
                }
            })
            .finally(() => setEnabling(false));
    };

    const confirmTwoFactorAuthentication = () => {
        confirmationForm.post(route("two-factor.confirm"), {
            errorBag: "confirmTwoFactorAuthentication",
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setConfirming(false);
                fetchRecoveryCodes(); // Fetch recovery codes after confirmation
            },
        });
    };

    const regenerateRecoveryCodes = () => {
        axios.post(route("two-factor.recovery-codes")).then(() => fetchRecoveryCodes());
    };

    const disableTwoFactorAuthentication = () => {
        setDisabling(true);
        axios
            .delete(route("two-factor.disable"))
            .then(() => {
                setLocallyEnabled(false);
                setQrCode(null);
                setSetupKey(null);
                setRecoveryCodes([]);
                setConfirming(false);
                setOtp("");
                setOtpError("");
            })
            .finally(() => setDisabling(false));
    };

    const cancelConfirmation = () => {
        setConfirming(false);
        setOtp("");
        setOtpError("");
    };

    return (
        <ActionSection
            title="Two Factor Authentication"
            description="Add additional security to your account using two factor authentication."
        >
            <div>
                {!locallyEnabled && (
                    <h3 className="text-lg font-medium text-gray-900">
                        You have not enabled two factor authentication.
                    </h3>
                )}

                {locallyEnabled && !confirming && (
                    <h3 className="text-lg font-medium text-gray-900">
                        You have enabled two factor authentication.
                    </h3>
                )}

                {locallyEnabled && confirming && (
                    <h3 className="text-lg font-medium text-gray-900">
                        Finish enabling two factor authentication.
                    </h3>
                )}

                <div className="mt-3 max-w-xl text-sm text-gray-600">
                    <p>
                        When two factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
                    </p>
                </div>

                {locallyEnabled && (
                    <>
                        {qrCode && (
                            <div>
                                <div className="mt-4 max-w-xl text-sm text-gray-600">
                                    {confirming
                                        ? "Scan the QR code or enter the setup key and provide the generated code."
                                        : "Scan the QR code below or enter the setup key."}
                                </div>
                                <div
                                    className="mt-4 p-2 inline-block bg-white"
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />
                                {setupKey && (
                                    <div className="mt-4 max-w-xl text-sm text-gray-600">
                                        <p className="font-semibold">
                                            Setup Key: <span>{setupKey}</span>
                                        </p>
                                    </div>
                                )}

                                {confirming && (
                                    <div className="mt-4">
                                        <InputLabel htmlFor="code" value="Code" />
                                        <TextInput
                                            id="code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            type="text"
                                            name="code"
                                            className="block mt-1 w-1/2"
                                            inputMode="numeric"
                                            autoFocus
                                            autoComplete="one-time-code"
                                            onKeyUp={(e) => e.key === "Enter" && confirmTwoFactorAuthentication()}
                                        />
                                        <InputError message={otpError} className="mt-2" />
                                    </div>
                                )}
                            </div>
                        )}

                        {recoveryCodes.length > 0 && !confirming && (
                            <div>
                                <div className="mt-4 max-w-xl text-sm text-gray-600">
                                    <p className="font-semibold">
                                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two factor authentication device is lost.
                                    </p>
                                </div>
                                <div className="grid gap-1 max-w-xl mt-4 px-4 py-4 font-mono text-sm bg-gray-100 rounded-lg">
                                    {recoveryCodes.map((code) => (
                                        <div key={code}>{code}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                    {!locallyEnabled ? (
                        <ConfirmsPassword onConfirmed={enableTwoFactorAuthentication}>
                            <PrimaryButton
                                type="button"
                                className={enabling ? "opacity-25" : ""}
                                disabled={enabling}
                            >
                                Enable
                            </PrimaryButton>
                        </ConfirmsPassword>
                    ) : (
                        <>
                            {confirming && (
                                <>
                                    <PrimaryButton
                                        type="button"
                                        className="me-3"
                                        onClick={confirmTwoFactorAuthentication}
                                        disabled={enabling}
                                    >
                                        Confirm
                                    </PrimaryButton>
                                    <SecondaryButton
                                        type="button"
                                        onClick={cancelConfirmation}
                                        disabled={disabling}
                                    >
                                        Cancel
                                    </SecondaryButton>
                                </>
                            )}

                            {recoveryCodes.length > 0 && !confirming && (
                                <ConfirmsPassword onConfirmed={regenerateRecoveryCodes}>
                                    <SecondaryButton className="me-3">
                                        Regenerate Recovery Codes
                                    </SecondaryButton>
                                </ConfirmsPassword>
                            )}

                            {recoveryCodes.length === 0 && !confirming && (
                                <ConfirmsPassword onConfirmed={showRecoveryCodes}>
                                    <SecondaryButton className="me-3">
                                        Show Recovery Codes
                                    </SecondaryButton>
                                </ConfirmsPassword>
                            )}

                            {!confirming && (
                                <ConfirmsPassword onConfirmed={disableTwoFactorAuthentication}>
                                    <DangerButton
                                        className={disabling ? "opacity-25" : ""}
                                        disabled={disabling}
                                    >
                                        Disable
                                    </DangerButton>
                                </ConfirmsPassword>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ActionSection>
    );
}
