import React, { useEffect } from 'react';
import './CustomAlert.css';
import { X, CheckCircle, AlertCircle, Info, FileText } from 'lucide-react';

const CustomAlert = ({ show, title, message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (show && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={24} />;
            case 'error': return <AlertCircle size={24} />;
            case 'warning': return <FileText size={24} />;
            default: return <Info size={24} />;
        }
    };

    return (
        <div className="custom-alert-overlay">
            <div className={`custom-alert-box ${type}`}>
                <div className="alert-icon-wrapper">
                    {getIcon()}
                </div>
                <div className="alert-content">
                    {title && <h3 className="alert-title">{title}</h3>}
                    <p className="alert-message">{message}</p>
                </div>
                <button className="alert-close-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;
