import React from 'react';
import Modal from './Modal';

export default function DialogModal({
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose,
    children,
}) {
    return (
        <Modal show={show} maxWidth={maxWidth} closeable={closeable} onClose={onClose}>
            <div className="px-6 py-4">
                <div className="text-lg font-medium text-gray-900">{children?.title}</div>
                <div className="mt-4 text-sm text-gray-600">{children?.content}</div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-100">{children?.footer}</div>
        </Modal>
    );
}
