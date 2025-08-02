import Head from "next/head";

const SEOHelmet = ({ title, description, canonical }) => {
  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content="index, follow" />
    </Head>
  );
};

export default SEOHelmet;
