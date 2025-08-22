import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | CoreFlow360',
  description: 'CoreFlow360 Terms of Service - Legal agreement for using our platform',
}

export default function TermsOfService() {
  const lastUpdated = '2024-01-20'
  const effectiveDate = '2024-01-20'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using CoreFlow360 ("Platform," "Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service, including but not limited to customers, vendors, contributors, and content creators.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Use License and Account Terms</h2>
              
              <h3 className="text-xl font-semibold mb-2">2.1 Account Creation</h3>
              <p>To use CoreFlow360, you must:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.2 License Grant</h3>
              <p>
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes.
              </p>

              <h3 className="text-xl font-semibold mb-2">2.3 Restrictions</h3>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malware, viruses, or harmful code</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use the Service to compete with us or build a similar service</li>
                <li>Resell, redistribute, or sublicense the Service without permission</li>
                <li>Use automated systems or bots without authorization</li>
                <li>Overwhelm or burden our infrastructure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Subscription and Payment</h2>
              
              <h3 className="text-xl font-semibold mb-2">3.1 Subscription Plans</h3>
              <p>
                CoreFlow360 offers various subscription plans with different features and limits. Details of current plans are available on our pricing page.
              </p>

              <h3 className="text-xl font-semibold mb-2">3.2 Billing</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                <li>All fees are in USD unless otherwise specified</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>You authorize us to charge your payment method automatically</li>
                <li>You are responsible for providing valid payment information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">3.3 Refunds</h3>
              <p>
                We offer a 30-day money-back guarantee for new subscriptions. After 30 days, payments are non-refundable except as required by law. No refunds are provided for partial months or unused services.
              </p>

              <h3 className="text-xl font-semibold mb-2">3.4 Free Trial</h3>
              <p>
                Free trials, if offered, automatically convert to paid subscriptions unless cancelled before the trial period ends. You may cancel at any time during the trial without charge.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mb-2">4.1 Our Property</h3>
              <p>
                The Service, including all content, features, and functionality, is owned by CoreFlow360 and protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold mb-2">4.2 Your Content</h3>
              <p>
                You retain ownership of content you upload to the Service ("User Content"). By uploading User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and distribute your content solely for providing the Service.
              </p>

              <h3 className="text-xl font-semibold mb-2">4.3 Feedback</h3>
              <p>
                Any feedback, suggestions, or ideas you provide about the Service becomes our property and may be used without compensation or attribution to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Privacy and Data Protection</h2>
              <p>
                Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to our collection and use of information as described in the Privacy Policy.
              </p>
              <p>
                You acknowledge that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>We process data according to your instructions as a data processor</li>
                <li>You are responsible for obtaining necessary consents for data you upload</li>
                <li>We implement appropriate security measures to protect data</li>
                <li>We will assist with your compliance obligations under applicable data protection laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Service Level Agreement (SLA)</h2>
              
              <h3 className="text-xl font-semibold mb-2">6.1 Uptime Commitment</h3>
              <p>
                We strive to maintain 99.9% uptime for the Service, calculated monthly, excluding scheduled maintenance.
              </p>

              <h3 className="text-xl font-semibold mb-2">6.2 Support</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Basic: Email support during business hours</li>
                <li>Professional: Priority email support with 24-hour response time</li>
                <li>Enterprise: Dedicated support with phone access and 4-hour response time</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">6.3 Maintenance</h3>
              <p>
                Scheduled maintenance will be announced at least 72 hours in advance and performed during off-peak hours when possible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Warranties and Disclaimers</h2>
              
              <h3 className="text-xl font-semibold mb-2">7.1 Service Warranty</h3>
              <p>
                We warrant that the Service will perform substantially in accordance with the documentation. This warranty does not apply to issues caused by factors outside our reasonable control.
              </p>

              <h3 className="text-xl font-semibold mb-2">7.2 Disclaimers</h3>
              <p className="font-semibold">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>The Service will meet all your requirements</li>
                <li>The Service will be uninterrupted or error-free</li>
                <li>All bugs or defects will be corrected</li>
                <li>The Service is free of viruses or harmful components</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="font-semibold mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, COREFLOW360 SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL.
              </p>
              <p>
                Our total liability for any claim arising from these Terms or use of the Service shall not exceed the amount paid by you to us in the 12 months preceding the claim.
              </p>
              <p>
                These limitations apply regardless of the legal theory on which the claim is based and even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless CoreFlow360, its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your User Content</li>
                <li>Your violation of any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              
              <h3 className="text-xl font-semibold mb-2">10.1 By You</h3>
              <p>
                You may terminate your account at any time through your account settings or by contacting support. Termination does not entitle you to refunds for unused periods.
              </p>

              <h3 className="text-xl font-semibold mb-2">10.2 By Us</h3>
              <p>
                We may suspend or terminate your account immediately for:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violation of these Terms</li>
                <li>Non-payment of fees</li>
                <li>Illegal or fraudulent activity</li>
                <li>Actions that harm other users or the Service</li>
                <li>Extended period of inactivity</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">10.3 Effect of Termination</h3>
              <p>
                Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Your access to the Service will cease immediately</li>
                <li>We may delete your data after 90 days</li>
                <li>You remain liable for any outstanding fees</li>
                <li>Provisions that should survive termination will remain in effect</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Disputes</h2>
              
              <h3 className="text-xl font-semibold mb-2">11.1 Governing Law</h3>
              <p>
                These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold mb-2">11.2 Arbitration</h3>
              <p>
                Any dispute arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.
              </p>

              <h3 className="text-xl font-semibold mb-2">11.3 Class Action Waiver</h3>
              <p>
                You agree to resolve disputes with us on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. General Provisions</h2>
              
              <h3 className="text-xl font-semibold mb-2">12.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and any other agreements referenced herein, constitute the entire agreement between you and CoreFlow360.
              </p>

              <h3 className="text-xl font-semibold mb-2">12.2 Modifications</h3>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be notified via email or platform notification at least 30 days before taking effect.
              </p>

              <h3 className="text-xl font-semibold mb-2">12.3 Severability</h3>
              <p>
                If any provision of these Terms is found invalid or unenforceable, the remaining provisions will continue in full force and effect.
              </p>

              <h3 className="text-xl font-semibold mb-2">12.4 Waiver</h3>
              <p>
                No waiver of any term shall be deemed a further or continuing waiver of such term or any other term.
              </p>

              <h3 className="text-xl font-semibold mb-2">12.5 Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our prior written consent. We may assign our rights and obligations without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p>For questions about these Terms, contact us at:</p>
              <div className="bg-gray-50 p-4 rounded mt-4">
                <p><strong>CoreFlow360 Legal Department</strong></p>
                <p>Email: legal@coreflow360.com</p>
                <p>Phone: 1-800-CORE-360</p>
                <p>Address: 2711 N Haskell Ave, Suite 2300, Dallas, TX 75204</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Acceptance</h2>
              <p className="font-semibold">
                BY USING COREFLOW360, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}