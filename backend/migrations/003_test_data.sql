-- Seed roles
INSERT INTO roles (id, role_name) VALUES
  (1, 'admin'),
  (2, 'manager'),
  (3, 'customer')
ON CONFLICT (id) DO NOTHING;

-- Seed a warehouse
INSERT INTO warehouses (location_name, address, capacity)
VALUES ('Main Warehouse', '123 Storage Blvd', 10000)
ON CONFLICT (id) DO NOTHING;

-- Seed a category
INSERT INTO categories (category)
VALUES ('Electronics')
ON CONFLICT (id) DO NOTHING;

-- Passwords are bcrypt hashed (cost 12): admin123 / manager123 / customer123
INSERT INTO users (email, password, real_name, role_id) VALUES
  ('admin@example.com',   '$2b$12$PBHp56EY8yhPAJmkD0xHqeB02x5FLYA81GkHWd3wVO9MgqZV8QhKe', 'Alice Admin',    1),
  ('manager@example.com', '$2b$12$Q5nt2EovvcHFOVSomWP9QuZGsSrdJ8ZROu.G.mQXyUdPJlgN1MlM2', 'Bob Manager',    2),
  ('customer@example.com','$2b$12$vausN18NEFGTtUUhE3aIduvzMecko62rhNH5nhRGsL/YvgMflVPIy', 'Carol Customer', 3)
ON CONFLICT (id) DO NOTHING;

-- Seed inventory items
INSERT INTO inventory (item_name, description, sku, cost_price, unit_price, quantity, category_id, warehouse_id) VALUES
  ('USB Cable',        'High-speed USB-C cable',   'USB-001', 2.50, 5.99, 200, 1, 1),
  ('Wireless Mouse',   'Ergonomic wireless mouse', 'MOU-002', 8.00, 19.99, 150, 1, 1),
  ('Mechanical Keyboard', 'RGB mechanical keyboard', 'KEY-003', 25.00, 59.99, 75, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Seed an order (pending) with two items
INSERT INTO orders (user_id, status, total_amount) VALUES
  (3, 'pending', 0)   -- customer
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, inventory_id, quantity, price_at_purchase) VALUES
  (1, 1, 2, 5.99),    -- 2x USB Cable
  (1, 2, 1, 19.99)    -- 1x Wireless Mouse
ON CONFLICT (id) DO NOTHING;

-- Update the order total to match the items
UPDATE orders
SET total_amount = (
  SELECT SUM(quantity * price_at_purchase) FROM order_items WHERE order_id = orders.id
)
WHERE id = 1;