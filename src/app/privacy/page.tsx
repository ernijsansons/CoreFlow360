import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | CoreFlow360',
  description: 'CoreFlow360 Privacy Policy - How we collect, use, and protect your data',
}

export default function PrivacyPolicy() {
  const lastUpdated = '2024-01-20'
  const effectiveDate = '2024-01-20'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                CoreFlow360 ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our business management platform and related services.
              </p>
              <p>
                By using CoreFlow360, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Name and contact information (email, phone number, address)</li>
                <li>Account credentials and authentication data</li>
                <li>Billing and payment information</li>
                <li>Company and business information</li>
                <li>Professional details and role information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.2 Business Data</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Customer and contact information you store in our system</li>
                <li>Financial and accounting data</li>
                <li>Project and task information</li>
                <li>Documents and files you upload</li>
                <li>Communication logs and history</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.3 Technical Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Providing and maintaining our services</li>
                <li>Processing transactions and billing</li>
                <li>Personalizing user experience</li>
                <li>Improving our platform and developing new features</li>
                <li>Communicating with you about updates, security alerts, and support</li>
                <li>Complying with legal obligations</li>
                <li>Protecting against fraud and security threats</li>
                <li>Analytics and performance monitoring</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
              <p>We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold mb-2">4.1 Service Providers</h3>
              <p>
                We work with third-party service providers who assist us in operating our platform:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Cloud hosting providers (AWS, Vercel)</li>
                <li>Payment processors (Stripe)</li>
                <li>Email service providers</li>
                <li>Analytics services</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">4.2 Legal Requirements</h3>
              <p>
                We may disclose information when required by law, court order, or government request, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>

              <h3 className="text-xl font-semibold mb-2">4.3 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>

              <h3 className="text-xl font-semibold mb-2">4.4 Consent</h3>
              <p>
                We may share your information with your explicit consent for specific purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption in transit (TLS/SSL) and at rest (AES-256)</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backups and disaster recovery procedures</li>
                <li>Employee training and confidentiality agreements</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights (GDPR & CCPA)</h2>
              <p>You have the following rights regarding your personal data:</p>
              
              <h3 className="text-xl font-semibold mb-2">6.1 Access and Portability</h3>
              <p>
                You can request a copy of your personal data in a structured, machine-readable format.
              </p>

              <h3 className="text-xl font-semibold mb-2">6.2 Correction</h3>
              <p>
                You can request correction of inaccurate or incomplete personal data.
              </p>

              <h3 className="text-xl font-semibold mb-2">6.3 Deletion</h3>
              <p>
                You can request deletion of your personal data, subject to legal requirements and legitimate business needs.
              </p>

              <h3 className="text-xl font-semibold mb-2">6.4 Restriction</h3>
              <p>
                You can request restriction of processing of your personal data in certain circumstances.
              </p>

              <h3 className="text-xl font-semibold mb-2">6.5 Objection</h3>
              <p>
                You can object to processing of your personal data for direct marketing or based on legitimate interests.
              </p>

              <h3 className="text-xl font-semibold mb-2">6.6 Non-Discrimination (CCPA)</h3>
              <p>
                We will not discriminate against you for exercising your privacy rights.
              </p>

              <p className="mt-4">
                To exercise these rights, contact us at privacy@coreflow360.com or through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p>
                We retain your data for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Active account data: Retained while account is active</li>
                <li>Closed account data: Retained for 90 days, then deleted</li>
                <li>Financial records: Retained for 7 years per legal requirements</li>
                <li>Analytics data: Aggregated and anonymized after 2 years</li>
                <li>Backup data: Retained according to our backup retention policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Standard Contractual Clauses for EU data transfers</li>
                <li>Privacy Shield framework compliance where applicable</li>
                <li>Adequate security measures regardless of location</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Maintain your session and preferences</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized content and features</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling cookies may limit some functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p>
                CoreFlow360 is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Your continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p>For privacy-related questions or concerns, contact us at:</p>
              <div className="bg-gray-50 p-4 rounded mt-4">
                <p><strong>CoreFlow360 Privacy Team</strong></p>
                <p>Email: privacy@coreflow360.com</p>
                <p>Phone: 1-800-CORE-360</p>
                <p>Address: 2711 N Haskell Ave, Suite 2300, Dallas, TX 75204</p>
                <p>Data Protection Officer: dpo@coreflow360.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Supervisory Authority</h2>
              <p>
                EU residents have the right to lodge a complaint with their local data protection authority if they believe we have not addressed their concerns adequately.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}