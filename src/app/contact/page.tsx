import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ContactDetails } from "@/components/contact/ContactDetails";

export const metadata: Metadata = {
  title: "Contact & Enquiry",
  description:
    "Contact Optech Computer Institute Deori. Submit an enquiry for admissions counseling, course details, or campus visit.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="contact_eyebrow"
        title="contact_title"
        titleAccent="contact_title_accent"
        description="contact_desc"
      />

      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[5fr_4fr] lg:gap-16">
          <EnquiryForm />
          <ContactDetails />
        </div>
      </section>
    </>
  );
}
