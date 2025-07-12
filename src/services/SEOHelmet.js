import React from "react";
import { Helmet } from "react-helmet-async";

const SEOHelmet = ({ title, description, canonical }) => {
  return (
    <Helmet>
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="robots" content="index, follow" />
      {title && <title>{title}</title>}
      {description && (
        <meta name="description" content={description} />
      )}
    </Helmet>
  );
};

export default SEOHelmet;