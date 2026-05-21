import React from 'react';
import './CustomModal.css';
import { X, CheckCircle, AlertCircle, Info, HelpCircle, AlertTriangle } from 'lucide-react';

const CustomModal = ({ 
    show, 
    title, 
    message, 
    children,
    type = 'info', 
    onClose, 
    onConfirm, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel' 
}) => {
    if (!show) return null;
    const isConfirm = typeof onConfirm === "function";

    const getIcon = () => {
        const iconSize = 32;
        switch (type) {
            case 'success': return <CheckCircle size={iconSize} className="icon-success" />;
            case 'error': return <AlertCircle size={iconSize} className="icon-error" />;
            case 'danger': return <AlertCircle size={iconSize} className="icon-error" />;
            case 'warning': return <AlertTriangle size={iconSize} className="icon-warning" />;
            case 'confirm': return <HelpCircle size={iconSize} className="icon-confirm" />;
            default: return <Info size={iconSize} className="icon-info" />;
        }
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className={`custom-modal-box ${type} ${isConfirm ? "confirm-mode" : ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-icon-wrapper">
                        {getIcon()}
                    </div>
                    {title && <h3 className="modal-title">{title}</h3>}
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="modal-body">
                    {message ? <div className="modal-message">{message}</div> : null}
                    {children}
                </div>
                
                <div className="modal-footer">
                    {isConfirm ? (
                        <>
                            <button className="modal-btn cancel" onClick={onClose}>
                                {cancelText}
                            </button>
                            <button className="modal-btn confirm" onClick={() => {
                                onConfirm();
                                onClose();
                            }}>
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button className="modal-btn ok" onClick={onClose}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomModal;
