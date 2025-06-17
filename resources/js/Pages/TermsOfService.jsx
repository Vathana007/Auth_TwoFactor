import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticationCardLogo from '@/Components/AuthenticationCardLogo';

export default function TermsOfService({ terms }) {
    return (
        <>
            <Head title="Terms of Service" />
            <div className="font-sans text-gray-900 antialiased">
                <div className="pt-4 bg-gray-100">
                    <div className="min-h-screen flex flex-col items-center pt-6 sm:pt-0">
                        <div>
                            <AuthenticationCardLogo />
                        </div>
                        <div
                            className="w-full sm:max-w-2xl mt-6 p-6 bg-white shadow-md overflow-hidden sm:rounded-lg prose"
                            dangerouslySetInnerHTML={{ __html: terms }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}