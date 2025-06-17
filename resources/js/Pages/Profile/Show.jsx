import React from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import LogoutOtherBrowserSessionsForm from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import SectionBorder from '@/Components/SectionBorder';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';

export default function Show({ confirmsTwoFactorAuthentication, sessions }) {
    const page = usePage();

    return (
        <AppLayout
            title="Profile"
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Profile
                </h2>
            }
        >
            <div>
                <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
                    {page.props.jetstream.canUpdateProfileInformation && (
                        <>
                            <UpdateProfileInformationForm user={page.props.auth.user} />
                            <SectionBorder />
                        </>
                    )}

                    {page.props.jetstream.canUpdatePassword && (
                        <>
                            <UpdatePasswordForm className="mt-10 sm:mt-0" />
                            <SectionBorder />
                        </>
                    )}

                    {page.props.jetstream.canManageTwoFactorAuthentication && (
                        <>
                            <TwoFactorAuthenticationForm
                                requiresConfirmation={confirmsTwoFactorAuthentication}
                                className="mt-10 sm:mt-0"
                            />
                            <SectionBorder />
                        </>
                    )}

                    <LogoutOtherBrowserSessionsForm sessions={sessions} className="mt-10 sm:mt-0" />

                    {page.props.jetstream.hasAccountDeletionFeatures && (
                        <>
                            <SectionBorder />
                            <DeleteUserForm className="mt-10 sm:mt-0" />
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}