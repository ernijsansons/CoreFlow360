import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | CoreFlow360',
  description: 'CoreFlow360 Cookie Policy - How we use cookies and similar technologies',
}

export default function CookiePolicy() {
  const lastUpdated = '2024-01-20'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last Updated: {lastUpdated}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our platform, and enabling certain features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p>CoreFlow360 uses cookies for the following purposes:</p>
              
              <h3 className="text-xl font-semibold mb-2">2.1 Essential Cookies</h3>
              <p>These cookies are necessary for the platform to function properly:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Session cookies:</strong> Maintain your login state</li>
                <li><strong>Security cookies:</strong> Protect against CSRF attacks</li>
                <li><strong>Load balancing:</strong> Ensure optimal performance</li>
                <li><strong>User preferences:</strong> Remember your settings</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.2 Functional Cookies</h3>
              <p>These enhance your experience by remembering choices you make:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Language and region preferences</li>
                <li>Dashboard layout and customizations</li>
                <li>Recently accessed items</li>
                <li>Theme preferences (light/dark mode)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.3 Analytics Cookies</h3>
              <p>These help us understand how you use our platform:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google Analytics:</strong> Track page views and user behavior</li>
                <li><strong>Vercel Analytics:</strong> Monitor performance metrics</li>
                <li><strong>Custom analytics:</strong> Track feature usage and adoption</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.4 Marketing Cookies</h3>
              <p>These may be used to show relevant advertisements:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Track conversions from marketing campaigns</li>
                <li>Measure advertising effectiveness</li>
                <li>Prevent showing the same ads repeatedly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Cookie Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">next-auth.session-token</td>
                      <td className="border border-gray-300 px-4 py-2">Authentication session</td>
                      <td className="border border-gray-300 px-4 py-2">30 days</td>
                      <td className="border border-gray-300 px-4 py-2">Essential</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">next-auth.csrf-token</td>
                      <td className="border border-gray-300 px-4 py-2">Security protection</td>
                      <td className="border border-gray-300 px-4 py-2">Session</td>
                      <td className="border border-gray-300 px-4 py-2">Essential</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">theme</td>
                      <td className="border border-gray-300 px-4 py-2">UI theme preference</td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                      <td className="border border-gray-300 px-4 py-2">Functional</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">locale</td>
                      <td className="border border-gray-300 px-4 py-2">Language preference</td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                      <td className="border border-gray-300 px-4 py-2">Functional</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">_ga</td>
                      <td className="border border-gray-300 px-4 py-2">Google Analytics</td>
                      <td className="border border-gray-300 px-4 py-2">2 years</td>
                      <td className="border border-gray-300 px-4 py-2">Analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">_ga_*</td>
                      <td className="border border-gray-300 px-4 py-2">Google Analytics 4</td>
                      <td className="border border-gray-300 px-4 py-2">2 years</td>
                      <td className="border border-gray-300 px-4 py-2">Analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">cookie_consent</td>
                      <td className="border border-gray-300 px-4 py-2">Cookie preferences</td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                      <td className="border border-gray-300 px-4 py-2">Essential</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p>
                Some cookies are placed by third-party services that appear on our pages:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                <li><strong>Google:</strong> Analytics and advertising</li>
                <li><strong>Intercom:</strong> Customer support chat (if enabled)</li>
                <li><strong>Sentry:</strong> Error tracking and monitoring</li>
              </ul>
              <p>
                These third parties have their own privacy policies governing their use of cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
              
              <h3 className="text-xl font-semibold mb-2">5.1 Cookie Consent</h3>
              <p>
                When you first visit our platform, you'll see a cookie consent banner. You can choose to accept all cookies, reject non-essential cookies, or customize your preferences.
              </p>

              <h3 className="text-xl font-semibold mb-2">5.2 Browser Settings</h3>
              <p>
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">5.3 Opt-Out Links</h3>
              <p>You can opt out of specific services:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-Out</a></li>
                <li><a href="https://www.networkadvertising.org/choices/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
                <li><a href="https://www.aboutads.info/choices/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Impact of Disabling Cookies</h2>
              <p>
                If you disable cookies, you may experience:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Inability to log in or maintain your session</li>
                <li>Loss of personalized settings and preferences</li>
                <li>Reduced functionality of certain features</li>
                <li>Need to re-enter information more frequently</li>
                <li>Less personalized user experience</li>
              </ul>
              <p>
                Essential cookies cannot be disabled while using our platform, as they are necessary for basic functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Local Storage and Similar Technologies</h2>
              <p>
                In addition to cookies, we may use:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Local Storage:</strong> Stores data in your browser with no expiration</li>
                <li><strong>Session Storage:</strong> Stores data for the duration of your session</li>
                <li><strong>IndexedDB:</strong> Stores larger amounts of structured data</li>
                <li><strong>Web Beacons:</strong> Small images that track email opens or page views</li>
              </ul>
              <p>
                These technologies are used similarly to cookies and are covered by this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Cookie Security</h2>
              <p>
                We implement security measures for our cookies:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>HTTPOnly flag to prevent JavaScript access to sensitive cookies</li>
                <li>Secure flag to ensure transmission only over HTTPS</li>
                <li>SameSite attribute to prevent CSRF attacks</li>
                <li>Regular expiration and rotation of session cookies</li>
                <li>Encryption of sensitive cookie data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Updating the "Last Updated" date</li>
                <li>Posting a notice on our platform</li>
                <li>Requesting renewed consent where required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded mt-4">
                <p><strong>CoreFlow360 Privacy Team</strong></p>
                <p>Email: privacy@coreflow360.com</p>
                <p>Phone: 1-800-CORE-360</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Legal Basis for Processing (GDPR)</h2>
              <p>
                Under GDPR, our legal bases for using cookies are:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Consent:</strong> For analytics and marketing cookies</li>
                <li><strong>Legitimate Interests:</strong> For functional and performance cookies</li>
                <li><strong>Contract:</strong> For essential cookies necessary to provide our services</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}