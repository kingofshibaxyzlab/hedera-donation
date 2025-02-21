import NavigationBar from "@/components/NavBar";
import React from "react";

const HowToUsePage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />

      <main className="container mx-auto py-16 px-6 md:px-20">
        <h2 className="text-5xl font-bold text-blue-800 mb-12 text-center">
          How to Use ShibaAngels
        </h2>

        {/* Getting Started Section */}
        <section className="bg-white p-10 rounded-xl shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Getting Started
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            To get started, you need to connect your wallet to our platform.
            Click on the <strong>"Connect Wallet"</strong> button at the top of
            the page. We support multiple wallets, so choose the one that works
            best for you.
          </p>
          <h4 className="text-2xl font-semibold text-blue-600 mb-4">
            Method 1: Connect via QR Code using WalletConnect
          </h4>
          <ol className="list-decimal list-inside mb-6 text-gray-700">
            <li>
              Click the <strong>"Connect Wallet"</strong> button at the top of
              the page.
            </li>
            <li>
              Select the <strong>WalletConnect</strong> option.
            </li>
            <li>
              Open your wallet app, choose <strong>WalletConnect</strong>, and
              scan the QR code displayed on the screen.
            </li>
            <li>
              Confirm the connection in your wallet to complete the process.
            </li>
          </ol>
          <h4 className="text-2xl font-semibold text-blue-600 mb-4">
            Method 2: Connect via Hashpack
          </h4>
          <ol className="list-decimal list-inside text-gray-700">
            <li>
              Click the <strong>"Connect Wallet"</strong> button at the top of
              the page.
            </li>
            <li>
              Select the <strong>Hashpack</strong> option.
            </li>
            <li>
              If you don’t have the Hashpack wallet yet, download it from this
              link:{" "}
              <a
                href="https://www.hashpack.app/"
                className="text-blue-500 underline"
              >
                https://www.hashpack.app/
              </a>
              .
            </li>
            <li>
              After downloading and setting up your Hashpack wallet, log in and
              proceed with the connection.
            </li>
          </ol>
        </section>

        {/* Creating a Campaign Section */}
        <section className="bg-white p-10 rounded-xl shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Creating a Campaign
          </h3>
          <ol className="list-decimal list-inside text-gray-700">
            <li>
              Click on the <strong>"Create Campaign"</strong> button.
            </li>
            <li>
              Fill out the campaign form with the following information:
              <ul className="list-disc list-inside ml-6">
                <li>
                  <strong>Title:</strong> A concise name for your campaign.
                </li>
                <li>
                  <strong>Description:</strong> Details about your cause and why
                  people should support it.
                </li>
                <li>
                  <strong>Donation Goal:</strong> The target amount you hope to
                  raise.
                </li>
                <li>
                  <strong>Images or Videos:</strong> Media that effectively
                  communicates your cause.
                </li>
              </ul>
            </li>
            <li>Submit the form.</li>
            <li>
              Your campaign will undergo a review process. Once approved, it
              will be published on the platform.
            </li>
          </ol>
        </section>

        {/* Donating to a Campaign Section */}
        <section className="bg-white p-10 rounded-xl shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Donating to a Campaign
          </h3>
          <ol className="list-decimal list-inside text-gray-700">
            <li>
              Click on the <strong>"All Campaigns"</strong> button to browse the
              list of available campaigns.
            </li>
            <li>
              Select a campaign that resonates with you by clicking on it to
              view more details.
            </li>
            <li>
              Click the <strong>"Donate Now"</strong> button on the campaign
              page.
            </li>
            <li>Enter the amount you wish to donate.</li>
            <li>
              Confirm and complete the transaction using your connected wallet.
            </li>
          </ol>
        </section>

        {/* Tracking Donations Section */}
        <section className="bg-white p-10 rounded-xl shadow-lg">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Tracking Your Campaigns
          </h3>
          <ol className="list-decimal list-inside text-gray-700">
            <li>
              Navigate to the <strong>"My Campaigns"</strong> section on your
              profile or dashboard.
            </li>
            <li>
              View the campaign’s progress, including the total funds raised and
              updates from the campaign creator.
            </li>
            <li>
              Verify your donation and transaction details directly on the
              blockchain for complete transparency.
            </li>
          </ol>
          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            This ensures you can see the impact of your contributions and
            maintain trust in the process.
          </p>
        </section>
      </main>
    </div>
  );
};

export default HowToUsePage;
