import Link from "next/link";
import { blogPosts, serviceSections } from "@/data/services";

export const metadata = {
  title: "HTML Sitemap",
  description:
    "Browse all key AdstraDigital pages, service pages, and blog posts from one sitemap page.",
  alternates: {
    canonical: "https://adstradigital.com/sitemap/",
  },
};

const staticPages = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
  { href: "/career/", label: "Careers" },
  { href: "/blogs/all/", label: "All Blogs" },
  { href: "/service/all/", label: "All Services" },
  { href: "/privacypolicy/", label: "Privacy Policy" },
  { href: "/TermsNconditions/", label: "Terms and Conditions" },
  { href: "/refundpolicy/", label: "Refund Policy" },
];

export default function SiteMapPage() {
  return (
    <main className="container py-5">
      <h1 className="text-center mb-2 fw-bold">Website Sitemap</h1>
      <p className="text-center text-muted mb-5">
        Use this page to quickly navigate all important sections.
      </p>

      <section className="mb-5">
        <h2 className="h4 mb-3">Core Pages</h2>
        <ul className="list-group">
          {staticPages.map((page) => (
            <li key={page.href} className="list-group-item bg-transparent">
              <Link href={page.href}>{page.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h4 mb-3">Services</h2>
        <ul className="list-group">
          {serviceSections.map((service) => (
            <li key={service.slug} className="list-group-item bg-transparent">
              <Link href={`/service/${service.slug}/`}>{service.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="h4 mb-3">Blog Posts</h2>
        <ul className="list-group">
          {blogPosts.map((blog) => (
            <li key={blog.slug} className="list-group-item bg-transparent">
              <Link href={`/blogs/${blog.slug}/`}>{blog.title}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
