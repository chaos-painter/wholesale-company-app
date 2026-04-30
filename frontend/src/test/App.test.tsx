import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import App from "../App";

beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    root = null;
    rootMargin = "";
    thresholds = [];

    constructor() {}

    takeRecords() {
      return [];
    }
  }

  window.IntersectionObserver = MockIntersectionObserver as any;
});

vi.mock("../api/inventory", () => ({
  listInventory: vi.fn().mockResolvedValue([]),
  getInventoryItem: vi.fn(),
  createInventoryItem: vi.fn(),
  updateInventoryItem: vi.fn(),
  deleteInventoryItem: vi.fn(),
}));

vi.mock("../api/categories", () => ({
  listCategories: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

vi.mock("../api/orders", () => ({
  listOrders: vi.fn().mockResolvedValue([]),
  getOrder: vi.fn(),
  createOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
  deleteOrder: vi.fn(),
}));

vi.mock("../api/warehouses", () => ({
  listWarehouses: vi.fn().mockResolvedValue([]),
}));

vi.mock("../api/roles", () => ({
  listRoles: vi.fn().mockResolvedValue([]),
}));

vi.mock("../api/users", () => ({
  listUsers: vi.fn().mockResolvedValue([]),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
});

describe("App routing", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it("renders navbar with logo text", async () => {
    render(<App />);
    const logoElements = await screen.findAllByText("Zereke");
    expect(logoElements.length).toBeGreaterThanOrEqual(2);
    expect(logoElements[0]).toBeInTheDocument();
  });

  it("shows links when not authenticated", async () => {
    render(<App />);
    await screen.findByText(/закупайте умнее/i);

    const catalogLinks = screen.getAllByRole("link", { name: /каталог/i });
    expect(catalogLinks.length).toBeGreaterThan(0);

    const loginLinks = screen.getAllByRole("link", { name: /войти/i });
    const registerLinks = screen.getAllByRole("link", { name: /регистрация/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(registerLinks.length).toBeGreaterThan(0);
  });

  it("shows catalog link in navbar", async () => {
    render(<App />);
    await screen.findByText(/закупайте умнее/i);

    const catalogLinks = screen.getAllByRole("link", { name: /каталог/i });
    expect(catalogLinks.length).toBeGreaterThan(0);
  });

  it("renders home page by default", async () => {
    render(<App />);

    await screen.findByText(/закупайте умнее/i);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/закупайте умнее/i);
    expect(h1).toHaveTextContent(/масштабируйтесь/i);
    expect(h1).toHaveTextContent(/быстрее/i);
  });
});
