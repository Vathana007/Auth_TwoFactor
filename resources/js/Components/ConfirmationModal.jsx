import React from 'react';
import Modal from './Modal';

export default function ConfirmationModal({
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose,
    title,
    content,
    footer,
}) {
    return (
        <Modal
            show={show}
            maxWidth={maxWidth}
            closeable={closeable}
            onClose={onClose}
        >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto shrink-0 flex items-center justify-center size-12 rounded-full bg-red-100 sm:mx-0 sm:size-10">
                        <svg className="size-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ms-4 sm:text-start">
                        <h3 className="text-lg font-medium text-gray-900">
                            {title}
                        </h3>
                        <div className="mt-4 text-sm text-gray-600">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-end px-6 py-4 bg-gray-100 text-end">
                {footer}
            </div>
        </Modal>
    );
}