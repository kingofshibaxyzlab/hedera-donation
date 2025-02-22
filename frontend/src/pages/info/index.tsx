import NavigationBar from "@/components/NavBar";
import React from "react";

const InfoPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />

      <main className="container mx-auto py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-blue-800 mb-12 text-center">
          About ShibaAngels
        </h2>

        <section className="bg-white p-10 rounded-xl shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">Our Mission</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            At ShibaAngels, our mission is to revolutionize the way people
            support meaningful causes by leveraging the power of blockchain
            technology. We are committed to fostering a culture of transparency,
            accountability, and empowerment. Through our platform, donors can
            contribute to campaigns that resonate with their values, ensuring
            every transaction is secure, traceable, and impactful.
          </p>

          <h3 className="text-3xl font-bold text-blue-700 mb-6">Our Vision</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            We envision a world where technology bridges the gap between
            generosity and trust. By embracing decentralization, we aim to
            create a global community of donors and organizations united by the
            shared goal of making a difference. ShibaAngels strives to be the
            benchmark for ethical giving in the digital age.
          </p>

          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Why Blockchain?
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            Blockchain technology is the cornerstone of our platform, providing
            unmatched security and transparency. With blockchain, we ensure that
            every donation is:
          </p>
          <ul className="list-disc list-inside text-lg text-gray-700 mb-10">
            <li>
              <strong>Secure:</strong> Contributions are safeguarded with
              state-of-the-art cryptographic technology.
            </li>
            <li>
              <strong>Transparent:</strong> Every transaction is publicly
              traceable, eliminating ambiguity and reducing fraud.
            </li>
            <li>
              <strong>Efficient:</strong> Funds go directly to the intended
              campaigns, minimizing administrative overhead.
            </li>
          </ul>

          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            How We Operate
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            At ShibaAngels, we partner with trusted campaign organizers to
            present impactful causes. Every campaign undergoes a rigorous
            vetting process to ensure alignment with our core values of
            integrity, transparency, and community impact. Our platform
            simplifies the donation process, allowing users to:
          </p>
          <ul className="list-disc list-inside text-lg text-gray-700 mb-10">
            <li>
              Discover verified campaigns that align with their interests and
              values.
            </li>
            <li>Make secure, token-based contributions.</li>
            <li>Track the usage of their donations in real-time.</li>
          </ul>

          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Why Choose ShibaAngels?
          </h3>
          <ul className="list-disc list-inside text-lg text-gray-700 mb-10">
            <li>
              <strong>Trust and Accountability:</strong> With blockchain at its
              core, our platform ensures that every donation is used as
              intended.
            </li>
            <li>
              <strong>Community-Driven:</strong> We prioritize causes that
              reflect the collective values of our global community.
            </li>
            <li>
              <strong>Innovation Meets Generosity:</strong> ShibaAngels combines
              cutting-edge technology with a human-centered approach to
              philanthropy.
            </li>
          </ul>

          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Future Development
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            In addition to our current offerings, we are dedicated to expanding
            and enhancing ShibaAngels in the future. Our goals include:
          </p>
          <ul className="list-disc list-inside text-lg text-gray-700">
            <li>
              Introducing Advanced Analytics: Providing donors and campaign
              organizers with detailed insights into the impact of their
              contributions.
            </li>
            <li>
              Expanding Partnerships: Collaborating with a broader network of
              trusted organizations to bring diverse and meaningful campaigns to
              our platform.
            </li>
            <li>
              Global Outreach: Growing our platform to support international
              campaigns, fostering a truly global community of generosity.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default InfoPage;
