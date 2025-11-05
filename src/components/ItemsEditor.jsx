import React from 'react';

const ItemsEditor = ({ items, allowedVatRates, onChangeItem, onAddItem, onRemoveItem, onSaveDraft, onLoadDraft }) => {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Είδη / Υπηρεσίες</h2>
        <div className="flex gap-2">
          <button onClick={onAddItem} className="bg-blue-600 text-white px-3 py-1 rounded">+ Γραμμή</button>
          <button onClick={onSaveDraft} className="bg-gray-700 text-white px-3 py-1 rounded">Αποθήκευση Πρόχειρου</button>
          <button onClick={onLoadDraft} className="bg-gray-500 text-white px-3 py-1 rounded">Φόρτωση Πρόχειρου</button>
        </div>
      </div>

      <div className="w-full overflow-auto border rounded-lg">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold bg-gray-50 border-b">
          <div className="col-span-4">Περιγραφή</div>
          <div className="col-span-1 text-right">Ποσ.</div>
          <div className="col-span-2 text-right">Τιμή</div>
          <div className="col-span-1 text-right">ΦΠΑ</div>
          <div className="col-span-1 text-right">Καθαρή</div>
          <div className="col-span-1 text-right">ΦΠΑ €</div>
          <div className="col-span-1 text-right">Σύνολο</div>
        </div>
        {items.map((item, idx) => {
          const net = Math.round((item.qty * item.price + Number.EPSILON) * 100) / 100;
          const vat = Math.round((net * (item.vatRate/100) + Number.EPSILON) * 100) / 100;
          const gross = Math.round((net + vat + Number.EPSILON) * 100) / 100;
          return (
            <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2 items-center border-b">
              <input className="col-span-4 border rounded px-2 py-1" placeholder="Περιγραφή" value={item.description}
                     onChange={(e)=>onChangeItem(idx,{ description:e.target.value })} />
              <input type="number" className="col-span-1 border rounded px-2 py-1 text-right" value={item.qty}
                     onChange={(e)=>onChangeItem(idx,{ qty:Number(e.target.value) })} />
              <input type="number" className="col-span-2 border rounded px-2 py-1 text-right" value={item.price}
                     onChange={(e)=>onChangeItem(idx,{ price:Number(e.target.value) })} />
              <select className="col-span-1 border rounded px-2 py-1 text-right" value={item.vatRate}
                      onChange={(e)=>onChangeItem(idx,{ vatRate:Number(e.target.value) })}>
                {allowedVatRates.map(r=> <option key={r} value={r}>{r}%</option>)}
              </select>
              <div className="col-span-1 text-right tabular-nums">{net.toFixed(2)}</div>
              <div className="col-span-1 text-right tabular-nums">{vat.toFixed(2)}</div>
              <div className="col-span-1 text-right tabular-nums">{gross.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ItemsEditor;
