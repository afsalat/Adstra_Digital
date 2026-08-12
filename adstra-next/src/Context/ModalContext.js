"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import CustomModal from "@/components/common/CustomModal/CustomModal";
import "@/components/common/CustomModal/CustomModal.css";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const showModal = useCallback(({ title, message, type = "info", onConfirm = null, confirmText = "Confirm", cancelText = "Cancel" }) => {
    setModal({
      show: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, show: false }));
  }, []);

  // Shorthand methods
  const showAlert = useCallback((title, message, type = "info", onConfirm = null) => {
    showModal({ title, message, type, onConfirm });
  }, [showModal]);

  // Confirmation modal with optional severity styling (e.g. "warning", "danger", "error").
  const showConfirm = useCallback((title, message, onConfirm, variant = "confirm") => {
    showModal({ title, message, type: variant, onConfirm });
  }, [showModal]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal, showAlert, showConfirm }}>
      {children}
      <CustomModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={hideModal}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
