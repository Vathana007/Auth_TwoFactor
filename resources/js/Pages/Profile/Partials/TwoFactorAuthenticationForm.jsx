import React, { useEffect, useState, useMemo } from "react";
import { useForm, usePage } from "@inertiajs/react";
import axios from "axios";
import ActionSection from "@/Components/ActionSection";
import ConfirmsPassword from "@/Components/ConfirmsPassword";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";
import DangerButton from "@/Components/DangerButton";
import InputLabel from "@/Components/InputLabel";

export default function TwoFactorAuthenticationForm() {
    const page = usePage();
    const [qrCode, setQrCode] = useState(null);
    const [setupKey, setSetupKey] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [confirming, setConfirming] = useState(false);
    const [enabling, setEnabling] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [twoFactorStatus, setTwoFactorStatus] = useState(false);
    const [confirmingPassword, setConfirmingPassword] = useState(false);

    const confirmationForm = useForm({ code: "" });

    // Initialize 2FA status from user data
    useEffect(() => {
        const user = page.props.auth.user;
        const isEnabled = !!(
            user?.two_factor_enabled ||
            user?.two_factor_confirmed_at ||
            user?.two_factor_secret
        );
        setTwoFactorStatus(isEnabled);
    }, [page.props.auth.user]);

    // whether the user already had 2FA enabled on page‐load
    const twoFactorEnabled = useMemo(() => {
        return !enabling && twoFactorStatus;
    }, [enabling, twoFactorStatus]);

    // always reset local state if they ever disable or page refreshes
    useEffect(() => {
        if (!twoFactorStatus && !confirming) {
            confirmationForm.reset();
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
        }
    }, [twoFactorStatus, confirming]);

    // single fetch helper
    const fetchQrAndKey = async () => {
        const [{ data: qr }, { data: key }] = await Promise.all([
            axios.get(route("two-factor.qr-code")),
            axios.get(route("two-factor.secret-key")),
        ]);
        setQrCode(qr.svg);
        setSetupKey(key.secretKey);
    };

    const fetchRecoveryCodes = async () => {
        const { data } = await axios.get(route("two-factor.recovery-codes"));
        setRecoveryCodes(data);
    };

    // 1) enable → 2) fetch QR/Key → 3) show confirmation UI
    const enableTwoFactorAuthentication = async () => {
        setEnabling(true);
        setConfirmingPassword(false); // Hide the button after password is confirmed
        try {
            await axios.post(route("two-factor.enable"));
            await fetchQrAndKey();
            setConfirming(true);
        } catch (e) {
            console.error(e);
        } finally {
            setEnabling(false);
        }
    };

    // Handle password confirmation for enabling 2FA
    const handlePasswordConfirmed = () => {
        setConfirmingPassword(true);
        enableTwoFactorAuthentication();
    };

    // post OTP code
    const confirmTwoFactorAuthentication = (e) => {
        e.preventDefault();
        confirmationForm.post(route("two-factor.confirm"), {
            preserveScroll: true,
            onSuccess: async () => {
                setConfirming(false);
                setTwoFactorStatus(true); // Update local state
                // Automatically fetch and show recovery codes after successful confirmation
                await fetchRecoveryCodes();
            },
            onError: (errors) => {
                console.error("Confirm error:", errors);
            },
        });
    };
    const regenerateRecoveryCodes = async () => {
        try {
            await axios.post(route("two-factor.recovery-codes.regenerate"));
            await fetchRecoveryCodes();
        } catch (error) {
            console.error("Error regenerating recovery codes:", error);
        }
    };

    const disableTwoFactorAuthentication = async () => {
        setDisabling(true);
        try {
            await axios.delete(route("two-factor.disable"));
            setConfirming(false);
            setQrCode(null);
            setSetupKey(null);
            setRecoveryCodes([]);
            setTwoFactorStatus(false); // Update local state
        } catch (e) {
            console.error(e);
        } finally {
            setDisabling(false);
        }
    };

    const cancelConfirmation = () => {
        setConfirming(false);
        setConfirmingPassword(false);
        setQrCode(null);
        setSetupKey(null);
        confirmationForm.reset();
    };

    return (
        <ActionSection
            title="Two Factor Authentication"
            description="Add additional security to your account using two-factor authentication."
        >
            <section>
                <header>
                    <h2 className="text-lg font-medium text-gray-900">
                        Two Factor Authentication
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Add additional security to your account using two factor
                        authentication.
                    </p>
                </header>
                <div className="mt-5">
                    {twoFactorEnabled ? (
                        <>
                            <p className="text-sm text-gray-600">
                                Two factor authentication is enabled and
                                protecting your account.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <ConfirmsPassword
                                    onConfirmed={fetchRecoveryCodes}
                                >
                                    <SecondaryButton className="border-2 border-blue-700 text-white bg-gray-800 px-6 py-2 rounded">
                                        RECOVERY CODES
                                    </SecondaryButton>
                                </ConfirmsPassword>
                                <ConfirmsPassword
                                    onConfirmed={disableTwoFactorAuthentication}
                                >
                                    <SecondaryButton
                                        className="bg-red-600 text-white px-6 py-2 rounded"
                                        disabled={disabling}
                                    >
                                        {disabling ? "Disabling..." : "DISABLE"}
                                    </SecondaryButton>
                                </ConfirmsPassword>
                            </div>
                            {/* Always show recovery codes if they exist */}
                            {recoveryCodes.length > 0 && (
                                <div className="mt-4">
                                    <div className="mb-2 font-semibold">
                                        Recovery Codes:
                                    </div>
                                    <ul className="list-disc pl-5">
                                        {recoveryCodes.map((code, idx) => (
                                            <li key={idx}>{code}</li>
                                        ))}
                                    </ul>
                                    <div className="mt-2">
                                        <ConfirmsPassword
                                            onConfirmed={
                                                regenerateRecoveryCodes
                                            }
                                        >
                                            <SecondaryButton className="text-sm">
                                                Regenerate Recovery Codes
                                            </SecondaryButton>
                                        </ConfirmsPassword>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Only show enable button if not confirming password and not confirming OTP */}
                            {!confirmingPassword && !confirming && (
                                <ConfirmsPassword
                                    onConfirmed={handlePasswordConfirmed}
                                >
                                    <PrimaryButton disabled={enabling}>
                                        {enabling
                                            ? "Enabling..."
                                            : "Enable Two Factor Authentication"}
                                    </PrimaryButton>
                                </ConfirmsPassword>
                            )}
                        </>
                    )}
                </div>
                {confirming && (
                    <form
                        onSubmit={confirmTwoFactorAuthentication}
                        className="mt-6"
                    >
                        <div>
                            <label
                                htmlFor="code"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Enter the OTP code from your authenticator app
                            </label>
                            <input
                                id="code"
                                type="text"
                                value={confirmationForm.data.code}
                                onChange={(e) =>
                                    confirmationForm.setData(
                                        "code",
                                        e.target.value
                                    )
                                }
                                className="mt-1 block w-1/2 rounded border-gray-300"
                                autoFocus
                                required
                            />
                            {confirmationForm.errors.code && (
                                <div className="text-red-600 text-sm mt-1">
                                    {confirmationForm.errors.code}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <PrimaryButton
                                type="submit"
                                disabled={confirmationForm.processing}
                            >
                                Confirm
                            </PrimaryButton>
                            <SecondaryButton
                                type="button"
                                onClick={cancelConfirmation}
                            >
                                Cancel
                            </SecondaryButton>
                        </div>
                        {qrCode && (
                            <div className="mt-4">
                                <div className="mb-2 font-semibold">
                                    Scan this QR code with your authenticator
                                    app:
                                </div>
                                <div
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />
                                {setupKey && (
                                    <div className="mt-2">
                                        <span className="font-semibold">
                                            Setup Key:
                                        </span>{" "}
                                        {setupKey}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                )}
            </section>
        </ActionSection>
    );
}