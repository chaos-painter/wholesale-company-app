CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TRIGGER handle_users_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();


CREATE TRIGGER handle_inventory_updated_at
BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER handle_orders_updated_at
BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER handle_orders_updated_at
BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_timestamp();