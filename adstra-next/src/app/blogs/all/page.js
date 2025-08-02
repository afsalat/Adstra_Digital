// app/blogs/all/page.js

import AllBlogsPage from "@/components/BlogList/BlogList";

export const metadata = {
  title: "Latest Blogs | Adstra Digital",
  description:
    "Explore Adstra Digital's latest blogs on SEO, marketing strategies, design, and more to stay ahead in the digital world.",
  alternates: {
    canonical: "https://adstradigital.com/blogs/all",
  },
};

export default function Page() {
  return (
    <>
      {/* ✅ Breadcrumb JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://adstradigital.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blogs",
                item: "https://adstradigital.com/blogs/all",
              },
            ],
          }),
        }}
      />
      <AllBlogsPage />
    </>
  );
}
