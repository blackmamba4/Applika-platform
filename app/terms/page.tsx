import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Applika",
  description: "Terms of service for Applika - user agreements, limitations, and platform rules.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Applika ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>Applika is an AI-powered platform that helps users:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Generate personalized cover letters</li>
              <li>Analyze job postings and match them with CVs</li>
              <li>Create professional documents using various templates</li>
              <li>Export documents in PDF format</li>
            </ul>
            <p className="mt-4">The Service is provided "as is" and we reserve the right to modify or discontinue the Service at any time.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Account Creation</h3>
                <p>To use our Service, you must:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be at least 13 years old (or the minimum age in your jurisdiction)</li>
                  <li>Not create multiple accounts to circumvent usage limits</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Account Responsibility</h3>
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All activities that occur under your account</li>
                  <li>Maintaining the confidentiality of your password</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Permitted Uses</h3>
                <p>You may use our Service to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Create cover letters for legitimate job applications</li>
                  <li>Analyze job postings for career purposes</li>
                  <li>Generate professional documents for personal use</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Prohibited Uses</h3>
                <p>You may not use our Service to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use automated tools to access the Service</li>
                  <li>Resell or redistribute our Service</li>
                  <li>Create misleading or fraudulent documents</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Your Content</h3>
                <p>You retain ownership of content you upload (CVs, job postings, etc.). By using our Service, you grant us a license to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Process your content to provide our services</li>
                  <li>Store your content securely</li>
                  <li>Generate cover letters based on your content</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Our Content</h3>
                <p>All templates, designs, and generated content remain our intellectual property. You may use generated cover letters for their intended purpose but may not redistribute our templates or designs.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Payment and Billing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Subscription Plans</h3>
                <p>We offer various subscription plans with different features and usage limits. Pricing and features may change with notice.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Payment Terms</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Payments are processed through Stripe</li>
                  <li>Subscriptions auto-renew unless cancelled</li>
                  <li>Refunds are handled on a case-by-case basis</li>
                  <li>You are responsible for all applicable taxes</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
            <p>We strive to maintain high service availability but cannot guarantee uninterrupted access. We may:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Perform scheduled maintenance</li>
              <li>Update or modify the Service</li>
              <li>Suspend service for security reasons</li>
              <li>Discontinue features with reasonable notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>We provide the Service "as is" without warranties</li>
              <li>We are not liable for indirect or consequential damages</li>
              <li>Our total liability is limited to the amount you paid for the Service</li>
              <li>We are not responsible for job application outcomes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p>You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the Service or violation of these terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Termination by You</h3>
                <p>You may cancel your account at any time through your account settings or by contacting us.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Termination by Us</h3>
                <p>We may suspend or terminate your account if you violate these terms or for other legitimate reasons.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p>These terms are governed by the laws of [Your Jurisdiction] and any disputes will be resolved in the courts of [Your Jurisdiction].</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p>We may update these terms from time to time. We will notify you of material changes by email or through the Service. Continued use constitutes acceptance of the new terms.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p>If you have questions about these terms, please contact us at:</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p><strong>Email:</strong> legal@applika.app</p>
              <p><strong>Website:</strong> https://www.applika.app</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
