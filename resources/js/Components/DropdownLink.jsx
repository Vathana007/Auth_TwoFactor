import React from 'react';
import { Link } from '@inertiajs/react';

export default function DropdownLink({ href, as, children }) {
    const baseClass =
        'block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out';

    if (as === 'button') {
        return (
            <div>
                <button
                    type="submit"
                    className={`w-full text-start ${baseClass}`}
                >
                    {children}
                </button>
            </div>
        );
    }

    if (as === 'a') {
        return (
            <div>
                <a href={href} className={baseClass}>
                    {children}
                </a>
            </div>
        );
    }

    return (
        <div>
            <Link href={href} className={baseClass}>
                {children}
            </Link>
        </div>
    );
}