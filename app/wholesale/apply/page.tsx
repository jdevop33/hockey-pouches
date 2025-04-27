import Link from 'next/link';
import Layout from '../../components/layout/NewLayout';
import WholesaleApplicationForm from '../../components/wholesale/WholesaleApplicationForm';

export const metadata = {
  title: 'Wholesale Application - PUXX',
  description: 'Apply for a wholesale account with PUXX nicotine pouches',
};

export default function WholesaleApplicationPage() {
  return (
    <Layout>
      <main className="flex min-h-screen flex-col bg-dark-500">
        {/* Hero Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 z-0">
            <div className="h-full w-full bg-dark-900" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark-800 to-dark-900"></div>
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                <span className="bg-gradient-gold bg-clip-text text-transparent">
                  Wholesale Application
                </span>
              </h1>
              <p className="mb-8 text-xl text-gray-300">
                Join our wholesale program and offer premium PUXX nicotine pouches to your
                customers. Minimum order quantity of 100 units required.
              </p>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section className="relative pb-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 grid gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <WholesaleApplicationForm />
              </div>

              <div>
                <div className="rounded-xl border border-gold-500/10 bg-dark-800/50 p-6 shadow-lg backdrop-blur-sm">
                  <h3 className="mb-4 text-xl font-bold text-gold-500">Wholesale Benefits</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <svg
                        className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-gold-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Competitive wholesale pricing</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-gold-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Priority shipping and fulfillment</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-gold-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-gold-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Access to exclusive product releases</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-gold-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Marketing materials and support</span>
                    </li>
                  </ul>

                  <div className="mt-8 border-t border-gold-500/10 pt-6">
                    <h4 className="mb-3 text-lg font-semibold text-white">Requirements</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Valid business license</li>
                      <li>• Minimum order of 100 units</li>
                      <li>• Age verification processes in place</li>
                      <li>• Compliance with local regulations</li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <h4 className="mb-3 text-lg font-semibold text-white">Questions?</h4>
                    <p className="text-sm text-gray-400">
                      Contact our wholesale department directly for any questions about our
                      wholesale program.
                    </p>
                    <Link
                      href="/contact"
                      className="mt-4 inline-block text-gold-500 hover:text-gold-400"
                    >
                      Contact Us →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
