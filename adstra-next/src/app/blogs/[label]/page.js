import { blogPosts } from "@/data/services";
import NavBar from "@/components/NavBar/navbar";
import Footer from "@/components/Footer/Footer";
import BlogDetail from "@/components/BlogDetails/BlogDetails";

// Static path generation
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    label: post.slug,
  }));
}

// SEO Metadata
export function generateMetadata({ params }) {
  const blog = blogPosts.find((b) => b.slug === params.label);

  if (!blog) {
    return {
      title: "Blog Not Found | AdstraDigital",
      description: "This blog post could not be found.",
    };
  }

  return {
    title: `${blog.excerptTitle} | AdstraDigital`,
    description: blog.excerpt || blog.content?.slice(0, 150),
    alternates: {
      canonical: `https://adstradigital.com/blogs/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [{ url: blog.imageUrl }],
      type: "article",
      url: `https://adstradigital.com/blogs/${blog.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blog.imageUrl],
    },
  };
}

// Blog Page Component
export default function BlogDetailPage({ params }) {
  const blog = blogPosts.find((b) => b.slug === params.label);

  if (!blog) {
    return (
      <>
        <NavBar />
        <div className="container py-5 text-center">
          <h2>Blog Not Found</h2>
          <p>The blog you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://adstradigital.com/blogs/${blog.slug}/`,
        "url": `https://adstradigital.com/blogs/${blog.slug}/`,
        "name": `${blog.excerptTitle} | AdstraDigital`,
        "isPartOf": {
          "@id": "https://adstradigital.com/blogs/all/"
        },
        "primaryImageOfPage": {
          "@id": `https://adstradigital.com${blog.imageUrl}`
        },
        "image": {
          "@id": `https://adstradigital.com${blog.imageUrl}`
        },
        "thumbnailUrl": `https://adstradigital.com${blog.imageUrl}`,
        "datePublished": blog.publishedDate,
        "dateModified": blog.publishedDate,
        "breadcrumb": {
          "@id": `https://adstradigital.com/blogs/${blog.slug}/#breadcrumb`
        },
        "inLanguage": "en-US",
        "potentialAction": [
          {
            "@type": "ReadAction",
            "target": [`https://adstradigital.com/blogs/${blog.slug}/`]
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://adstradigital.com/blogs/${blog.slug}/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://adstradigital.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blogs",
            "item": "https://adstradigital.com/blogs/all/"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `${blog.excerptTitle} | AdstraDigital`,
            "item": `https://adstradigital.com/blogs/${blog.slug}/`
          }
        ]
      },
      {
        "@type": "Article",
        "@id": `https://adstradigital.com/blogs/${blog.slug}/#article`,
        "isPartOf": {
          "@id": "https://adstradigital.com/blogs/all/"
        },
        "author": {
          "@type": "Organization",
          "name": "Adstra Digital",
          "url": "https://adstradigital.com/"
        },
        "headline": `${blog.title}`,
        "description": blog.excerpt,
        "datePublished": blog.publishedDate,
        "dateModified": blog.publishedDate,
        "mainEntityOfPage": {
          "@id": `https://adstradigital.com/blogs/${blog.slug}/`
        },
        "publisher": {
          "@id": "https://adstradigital.com/#organization"
        },
        "image": {
          "@id": `https://adstradigital.com${blog.imageUrl}`
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "BlogPosting",
        "@id": `https://adstradigital.com/blogs/${blog.slug}/#blogpost`,
        "headline": blog.title,
        "alternativeHeadline": blog.excerptTitle,
        "description": blog.excerpt,
        "image": `https://adstradigital.com${blog.imageUrl}`,
        "author": {
          "@type": "Person",
          "name": blog.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Adstra Digital",
          "logo": {
            "@type": "ImageObject",
            "url": "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png"
          }
        },
        "mainEntityOfPage": `https://adstradigital.com/blogs/${blog.slug}/`,
        "datePublished": blog.publishedDate,
        "dateModified": blog.publishedDate,
        "inLanguage": "en-US"
      },
      {
        "@type": "ImageObject",
        "@id": `https://adstradigital.com${blog.imageUrl}`,
        "inLanguage": "en-US",
        "url": `https://adstradigital.com${blog.imageUrl}`,
        "contentUrl": `https://adstradigital.com${blog.imageUrl}`,
        "width": 1200,
        "height": 628
      },
      {
        "@type": "Organization",
        "@id": "https://adstradigital.com/#organization",
        "name": "Adstra Digital",
        "url": "https://adstradigital.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png",
          "inLanguage": "en-US",
          "url": "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png",
          "contentUrl": "https://adstradigital.com/_next/static/media/logo-new-03.a8aee72e.png",
          "width": 250,
          "height": 60
        },
        "sameAs": [
          "https://www.facebook.com/adstradigital",
          "https://www.instagram.com/adstradigital",
          "https://www.linkedin.com/company/adstradigital"
        ]
      }
    ]
  };

  return (
    <>
      <NavBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogDetail blog={blog} />
      <Footer />
    </>
  );
}
