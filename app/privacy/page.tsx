import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Applika",
  description: "Privacy policy for Applika - how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Personal Information</h3>
                <p>When you use Applika, we may collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Name and email address (from OAuth providers like Google/LinkedIn)</li>
                  <li>Profile information you provide</li>
                  <li>CV/resume content you upload</li>
                  <li>Cover letters you create</li>
                  <li>Job postings you analyze</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Usage Data</h3>
                <p>We automatically collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Features used and interactions with our service</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Provide and improve our cover letter generation service</li>
              <li>Analyze job postings and match them with your CV</li>
              <li>Personalize your experience and recommendations</li>
              <li>Process payments and manage your subscription</li>
              <li>Communicate with you about our service</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your information only in these circumstances:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Service Providers:</strong> With trusted third parties who help us operate our platform (hosting, analytics, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information on a need-to-know basis</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Remember your preferences and login status</li>
              <li>Analyze usage patterns and improve our service</li>
              <li>Provide personalized content and recommendations</li>
            </ul>
            <p className="mt-4">You can control cookie settings through your browser preferences.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
            <p>Our platform integrates with:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Supabase:</strong> For authentication and database services</li>
              <li><strong>OpenAI:</strong> For AI-powered content generation</li>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>Google Analytics:</strong> For usage analytics</li>
            </ul>
            <p className="mt-4">These services have their own privacy policies that govern their use of your information.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p>We retain your information for as long as:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Your account is active</li>
              <li>Needed to provide our services</li>
              <li>Required by law or for legitimate business purposes</li>
            </ul>
            <p className="mt-4">You can request deletion of your account and data at any time.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. International Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>If you have questions about this privacy policy or our data practices, please contact us at:</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p><strong>Email:</strong> privacy@applika.app</p>
              <p><strong>Website:</strong> https://www.applika.app</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
