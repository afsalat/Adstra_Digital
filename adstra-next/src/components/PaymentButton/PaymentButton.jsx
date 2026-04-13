"use client";

import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import "./PaymentButton.css";

const API_URL = API_BASE_URL;

export default function PaymentButton({
    invoiceId,
    invoiceNo,
    amount,
    clientName = "",
    clientEmail = "",
    clientPhone = "",
    onSuccess,
    onFailure,
    buttonText = "Pay Now",
    className = ""
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // Create Razorpay order
            const { data: orderData } = await axios.post(
                `${API_URL}/invoice/payment/create-order/${invoiceId}/`
            );

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "AdstraDigital",
                description: `Payment for Invoice #${invoiceNo}`,
                order_id: orderData.order_id,
                prefill: {
                    name: clientName || orderData.client_name,
                    email: clientEmail || orderData.client_email,
                    contact: clientPhone || orderData.client_phone,
                },
                theme: {
                    color: "#ffd700",
                },
                handler: async function (response) {
                    try {
                        // Verify payment
                        const { data: verifyData } = await axios.post(
                            `${API_URL}/invoice/payment/verify/`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }
                        );

                        if (verifyData.success) {
                            if (onSuccess) {
                                onSuccess(verifyData);
                            } else {
                                alert("Payment successful! Invoice has been marked as paid.");
                                window.location.reload();
                            }
                        }
                    } catch (verifyError) {
                        console.error("Payment verification failed:", verifyError);
                        setError("Payment verification failed. Please contact support.");
                        if (onFailure) {
                            onFailure(verifyError);
                        }
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            setLoading(false);

        } catch (err) {
            console.error("Payment initialization failed:", err);
            setError(err.response?.data?.error || "Failed to initiate payment");
            setLoading(false);
            if (onFailure) {
                onFailure(err);
            }
        }
    };

    return (
        <div className="payment-button-wrapper">
            <button
                className={`payment-button ${className} ${loading ? "loading" : ""}`}
                onClick={handlePayment}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        Processing...
                    </>
                ) : (
                    <>
                        <span className="payment-icon">💳</span>
                        {buttonText}
                    </>
                )}
            </button>
            {error && <p className="payment-error">{error}</p>}
        </div>
    );
}
