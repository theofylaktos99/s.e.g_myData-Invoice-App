import React from 'react';

const ProductManager = ({
  products,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  subtotal,
  vat,
  total
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Προϊόντα Τιμολογίου</h3>
        <p className="text-slate-600">Επιλέξτε και διαχειριστείτε τα προϊόντα</p>
      </div>

      <div className="p-8">
        {/* Product Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {products.map(product => (
            <div key={product.id} className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-slate-800">{product.name}</h4>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                </div>
                <button
                  onClick={() => onAddProduct(product.id)}
                  className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors font-medium"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Επιλεγμένα Προϊόντα</h4>
            <div className="space-y-3">
              {selectedProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <h5 className="font-medium text-slate-800">{product.name}</h5>
                    <p className="text-sm text-slate-600">{formatCurrency(product.price)} x {product.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
                        className="w-8 h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{product.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
                        className="w-8 h-8 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-slate-800 min-w-20 text-right">
                      {formatCurrency(product.price * product.quantity)}
                    </span>
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        {selectedProducts.length > 0 && (
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-700">
                <span>Υποσύνολο:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>ΦΠΑ (24%):</span>
                <span className="font-semibold">{formatCurrency(vat)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-800 border-t border-emerald-300 pt-2">
                <span>Σύνολο:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}

        {selectedProducts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-4">🛒</div>
            <p>Δεν έχετε επιλέξει προϊόντα ακόμα</p>
            <p className="text-sm">Κάντε κλικ στο + για να προσθέσετε προϊόντα</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;