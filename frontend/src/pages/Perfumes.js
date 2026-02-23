import React from 'react';
import ProductList from '../components/products/ProductList';

const Perfumes = () => {
  return (
    <ProductList
      categorySlug="perfumes"
      categoryName="Perfumes"
      categoryDescription="Discover our premium collection of luxury perfumes crafted from the finest ingredients worldwide."
    />
  );
};

export default Perfumes;