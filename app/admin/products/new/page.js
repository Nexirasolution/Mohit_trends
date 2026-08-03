import ProductForm from '@/components/admin/ProductForm';

// Mohith Trends theme tokens — keep in sync with other admin pages until centralized in tailwind.config.js
const INK = '#1A1A1A';

export default function NewProductPage() {
  return (
    <div>
      <h1
        className="text-2xl mb-6 tracking-tight"
        style={{ color: INK, fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Add New Product
      </h1>
      <ProductForm />
    </div>
  );
}