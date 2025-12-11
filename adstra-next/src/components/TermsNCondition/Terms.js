import './Terms.css';
export const metadata = {
  title: 'Terms & Conditions - adinvoice.in',
  description: 'Please read these terms carefully before using our platform.',
};

export default function TermsAndConditions() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="terms-page">
      
      {/* Header */}
      <header className="terms-header">
        <div className="header-container">
          <div className="logo">
            adinvoice.in
          </div>
          <nav>
            <a href="/" className="nav-link">Home</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          
          {/* Page Title */}
          <div className="page-title-section">
            <h1 className="main-title">Terms & Conditions</h1>
            <p className="sub-title">
              Please read these terms carefully before using our platform.
            </p>
          </div>

          {/* White Card Container */}
          <div className="terms-card">
            
            {/* Section 1 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">1</span>
                Acceptance of Terms
              </h2>
              <p className="section-text">
                By accessing or using <strong>adinvoice.in</strong>, you agree to
                comply with these Terms & Conditions. If you do not agree, you
                must discontinue use of the platform immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">2</span>
                Services Provided
              </h2>
              <p className="section-text">
                adinvoice.in offers online invoicing tools to create, manage, and
                share invoices digitally. The platform may include features such
                as client management, payment tracking, and reporting.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">3</span>
                User Responsibilities
              </h2>
              <ul className="section-list">
                <li>You are responsible for the accuracy of all information entered into invoices.</li>
                <li>You agree not to use the platform for fraudulent, illegal, or unauthorized purposes.</li>
                <li>You must maintain the confidentiality of your account credentials.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">4</span>
                Data & Privacy
              </h2>
              <ul className="section-list">
                <li>All data entered into adinvoice.in remains your responsibility.</li>
                <li>We implement reasonable security measures to protect your information, but we cannot guarantee absolute protection against unauthorized access.</li>
                <li>Usage of the platform is subject to our Privacy Policy.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">5</span>
                Payments & Fees
              </h2>
              <ul className="section-list">
                <li>Certain features may be offered as paid services.</li>
                <li>Fees, if applicable, will be communicated clearly before purchase.</li>
                <li>Non-payment may result in suspension or termination of access.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">6</span>
                Intellectual Property
              </h2>
              <ul className="section-list">
                <li>All content, design, and technology of adinvoice.in are owned by <strong>Adstra Digital</strong>.</li>
                <li>Users are granted a limited, non-transferable license to use the platform for invoicing purposes only.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">7</span>
                Limitation of Liability
              </h2>
              <ul className="section-list">
                <li>adinvoice.in is provided “as is” without warranties of any kind.</li>
                <li>Adstra Digital shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">8</span>
                Termination
              </h2>
              <ul className="section-list">
                <li>We reserve the right to suspend or terminate accounts that violate these Terms & Conditions.</li>
                <li>Upon termination, access to invoicing data may be restricted.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="section-heading">
                <span className="number-badge">9</span>
                Amendments
              </h2>
              <ul className="section-list">
                <li>These Terms & Conditions may be updated periodically.</li>
                <li>Continued use of the platform after changes indicates acceptance of the revised terms.</li>
              </ul>
            </section>

            {/* Section 10 - Special Box */}
            <section className="highlight-box">
              <h2 className="section-heading">
                <span className="number-badge dark">10</span>
                Governing Law
              </h2>
              <ul className="section-list">
                <li>These Terms & Conditions are governed by the laws of <strong>India</strong>.</li>
                <li>Any disputes shall be subject to the jurisdiction of courts in <strong>Kozhikode, Kerala</strong>.</li>
              </ul>
            </section>
          </div>

          {/* Contact Note */}
          <div className="contact-footer">
            <p>If you have any questions regarding these terms, please contact us.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="copyright-text">
          &copy; {currentYear} Adstra Digital. All rights reserved.
        </div>
      </footer>
    </div>
  );
}