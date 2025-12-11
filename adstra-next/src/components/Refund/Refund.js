

const NonRefundPolicy = () => {
  // We use this to inject the CSS string directly into the component
  const internalStyles = `
    /* --- CSS Reset & Variables --- */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    .policy-container {
        font-family: 'Inter', sans-serif;
        background-color: #f9fafb; /* gray-50 */
        color: #1f2937; /* gray-800 */
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        line-height: 1.5;
    }

    a { text-decoration: none; color: inherit; }
    ul { list-style: none; }

    /* --- Header Styles --- */
    .policy-header {
        background-color: #ffffff;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        position: sticky;
        top: 0;
        z-index: 50;
    }

    .header-inner {
        max-width: 56rem;
        margin: 0 auto;
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        font-size: 1.25rem;
        font-weight: 700;
        color: #2563eb;
        letter-spacing: -0.025em;
    }

    .nav-link {
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
        transition: color 0.2s;
        display: none;
    }
    
    @media (min-width: 640px) {
        .nav-link { display: block; }
        .nav-link:hover { color: #2563eb; }
    }

    /* --- Main Content Layout --- */
    .policy-main { flex-grow: 1; }

    .content-wrapper {
        max-width: 48rem;
        margin: 0 auto;
        padding: 3rem 1.5rem;
    }

    /* --- Typography & Titles --- */
    .page-header {
        margin-bottom: 2.5rem;
        text-align: center;
    }

    .page-title {
        font-size: 1.875rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
    }

    .icon-large { font-size: 1.875rem; }
    .page-subtitle { color: #6b7280; }

    /* Responsive Title Alignment */
    @media (min-width: 640px) {
        .page-header { text-align: left; }
        .page-title { 
            font-size: 2.25rem;
            justify-content: flex-start; 
        }
    }

    /* --- Cards (White Boxes) --- */
    .card {
        background-color: #ffffff;
        border-radius: 1rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #f3f4f6;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    @media (min-width: 640px) {
        .card { padding: 2.5rem; }
    }

    .card-text {
        color: #4b5563;
        line-height: 1.625;
        margin-bottom: 1.5rem;
    }

    /* --- Alert Box (Red) --- */
    .alert-box {
        background-color: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 1.5rem;
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .alert-list li {
        display: flex;
        align-items: flex-start;
        margin-bottom: 1rem;
        color: #374151;
    }
    
    .alert-list li:last-child { margin-bottom: 0; }

    .bullet {
        color: #ef4444;
        margin-right: 0.75rem;
        margin-top: 0.25rem;
    }

    .note { color: #4b5563; font-style: italic; }

    /* --- FAQ Section --- */
    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .faq-item { margin-bottom: 1.5rem; }
    .faq-question {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.5rem;
    }
    .faq-answer { color: #4b5563; }

    /* --- Jurisdiction Box --- */
    .legal-box {
        background-color: #f9fafb;
        padding: 1.5rem;
        border-radius: 0.75rem;
        border: 1px solid #e5e7eb;
    }

    .legal-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
    }

    .badge {
        background-color: #1f2937;
        color: #ffffff;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        margin-right: 0.75rem;
    }

    /* --- Footer --- */
    .footer-note {
        margin-top: 3rem;
        text-align: center;
        border-top: 1px solid #e5e7eb;
        padding-top: 2rem;
        color: #6b7280;
        font-size: 0.875rem;
    }

    .policy-footer {
        background-color: #ffffff;
        border-top: 1px solid #e5e7eb;
        padding: 2rem 0;
        margin-top: auto;
    }

    .footer-content {
        max-width: 56rem;
        margin: 0 auto;
        padding: 0 1.5rem;
        text-align: center;
        color: #9ca3af;
        font-size: 0.875rem;
    }
  `;

  return (
    <div className="policy-container">
        {/* Inject Styles */}
        <style dangerouslySetInnerHTML={{ __html: internalStyles }} />
        
        {/* Header */}
        <header className="policy-header">
            <div className="header-inner">
                <div className="logo">adinvoice.in</div>
                <nav>
                    <a href="#" className="nav-link">Home</a>
                </nav>
            </div>
        </header>

        {/* Main Content */}
        <main className="policy-main">
            <div className="content-wrapper">
                
                {/* Page Title */}
                <div className="page-header">
                    <h1 className="page-title">
                        <span className="bullet icon-large">🚫</span> Non-Refund Policy
                    </h1>
                    <p className="page-subtitle">
                        Transparency and fairness in our services.
                    </p>
                </div>

                {/* Content Container */}
                <div>
                    
                    {/* Main Policy Block */}
                    <div className="card">
                        <p className="card-text">
                            At <strong>Adstra Digital</strong>, we value transparency and fairness in all our services. To ensure clarity for every user, we maintain a strict <strong>non-refund policy</strong> for the adinvoice.in platform.
                        </p>

                        <div className="alert-box">
                            <ul className="alert-list">
                                <li>
                                    <span className="bullet">•</span>
                                    <span>Once a service has been activated or used, even for a short duration (including within 24 hours), <strong>no refunds will be issued</strong>.</span>
                                </li>
                                <li>
                                    <span className="bullet">•</span>
                                    <span>This policy exists because we have observed instances where the system was used temporarily for invoicing purposes, followed by refund claims. Such usage is not aligned with the intended purpose of our platform.</span>
                                </li>
                                <li>
                                    <span className="bullet">•</span>
                                    <span>By using adinvoice.in, you acknowledge and agree that all payments made are final and non-refundable.</span>
                                </li>
                            </ul>
                        </div>

                        <p className="note">
                            We encourage users to carefully review their requirements before subscribing or making payments. Our team is always available to guide you in understanding the features and ensuring that the platform meets your needs prior to purchase.
                        </p>
                    </div>

                    {/* FAQ Section */}
                    <div className="card">
                        <h2 className="section-title">FAQ – Non-Refund Policy</h2>
                        
                        <div>
                            {/* Q1 */}
                            <div className="faq-item">
                                <h3 className="faq-question">Q1: Why doesn’t adinvoice.in offer refunds?</h3>
                                <p className="faq-answer">Because our services are instantly accessible once activated, they are considered “used” from the moment of access. Refunds after usage would compromise fairness and system integrity.</p>
                            </div>

                            {/* Q2 */}
                            <div className="faq-item">
                                <h3 className="faq-question">Q2: What if I only used the system for a few hours?</h3>
                                <p className="faq-answer">Even short-term usage counts as full access. Therefore, refunds are not possible once the service has been activated.</p>
                            </div>

                            {/* Q3 */}
                            <div className="faq-item">
                                <h3 className="faq-question">Q3: How can I avoid issues before subscribing?</h3>
                                <p className="faq-answer">We recommend reviewing your invoicing needs carefully and exploring our feature details before making payment. Our support team can help clarify any questions in advance.</p>
                            </div>

                            {/* Q4 */}
                            <div className="faq-item">
                                <h3 className="faq-question">Q4: Can I cancel future billing cycles?</h3>
                                <p className="faq-answer">Yes, you may cancel upcoming subscriptions to prevent future charges. However, past payments remain non-refundable.</p>
                            </div>

                            {/* Q5 */}
                            <div className="faq-item">
                                <h3 className="faq-question">Q5: Who can I contact for guidance before purchase?</h3>
                                <p className="faq-answer">You can reach out to our support team for assistance in understanding features, pricing, and suitability for your business.</p>
                            </div>
                        </div>
                    </div>

                    {/* Jurisdiction Block */}
                    <div className="legal-box">
                        <h2 className="legal-title">
                            <span className="badge">Legal</span>
                            Jurisdiction
                        </h2>
                        <p className="card-text" style={{ marginBottom: 0 }}>
                            All legal matters, disputes, or claims arising from the use of adinvoice.in shall be governed by the laws of <strong>India</strong>. The exclusive jurisdiction for any legal proceedings will be the courts located in <strong>Kozhikode, Kerala</strong> only.
                            <br /><br />
                            By using our services, you acknowledge and agree to this jurisdiction clause.
                        </p>
                    </div>

                </div>

                {/* Contact / Footer Note */}
                <div className="footer-note">
                    <p>Have questions about this policy? Contact our support team.</p>
                </div>
            </div>
        </main>

        {/* Footer */}
        <footer className="policy-footer">
            <div className="footer-content">
                <p>
                    &copy; {new Date().getFullYear()} Adstra Digital. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
  );
};

export default NonRefundPolicy;