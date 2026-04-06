"use client";

import "./CloudDivider.css";

export default function CloudDivider() {
  return (
    <section className="cloud-divider" aria-hidden="true">
      <div className="cloud-divider__veil" />
      <div className="clouds">
        <div className="clouds-1" />
        <div className="clouds-2" />
        <div className="clouds-3" />
      </div>
    </section>
  );
}
