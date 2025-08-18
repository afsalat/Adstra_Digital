export default function Modal({ children, onClose }) {
  return (
    <>
      {/* Overlay background */}
      <div
        onClick={onClose} // close modal when clicking outside the content
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}
      />
      {/* Modal content */}
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          borderRadius: 8,
          padding: 20,
          zIndex: 1001,
          width: "90%",
          maxWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer",
            float: "right",
          }}
        >
          Close
        </button>
        {children}
      </div>
    </>
  );
}
