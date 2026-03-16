import React, { useState } from "react";

function Menu() {
  const [items, setItems] = useState([
    { id: 1, name: "Pizza", price: 120 },
    { id: 2, name: "Cold Drink", price: 50 },
  ]);

  const [newItem, setNewItem] = useState({ name: "", price: "" });

  const addItem = () => {
    if (!newItem.name || !newItem.price) return;
    setItems([...items, { id: Date.now(), ...newItem }]);
    setNewItem({ name: "", price: "" });
  };

  return (
    <div>
      <h1>🍴 Menu Items</h1>
      <ul>
        {items.map((i) => (
          <li key={i.id}>{i.name} - ₹{i.price}</li>
        ))}
      </ul>

      <h3>Add New Item</h3>
      <input
        placeholder="Name"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
      />
      <input
        placeholder="Price"
        type="number"
        value={newItem.price}
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
      />
      <button onClick={addItem}>Add</button>
    </div>
  );
}

export default Menu;
