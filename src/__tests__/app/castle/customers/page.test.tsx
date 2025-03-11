import { render, screen } from "@testing-library/react";

import { getUsersWithRole } from "@/actions/clerk/action";

// Create mock components using jest.fn()
const mockUsersTable = jest.fn(() => (
  <div data-testid="users-table">Users Table Mock</div>
));
const mockPageTitle = jest.fn(() => <h1>Customers Management</h1>);

// Helper function to safely get props from mock call with proper typing
function getMockProps<T>(mockFn: jest.Mock): T {
  if (mockFn.mock.calls.length === 0) {
    return {} as T;
  }

  return mockFn.mock.calls[0][0] as T;
}

// Mock the dependencies
jest.mock("@/actions/clerk/action", () => ({
  getUsersWithRole: jest.fn(),
}));

// Mock the UsersTable component to avoid useRouter() issues
jest.mock("@/components/castle/UsersTable", () => ({
  UsersTable: mockUsersTable,
}));

// Mock PageTitle to verify props
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: mockPageTitle,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
  })),
}));

describe("UsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls getUsersWithRole(false) and renders the page", async () => {
    // Setup mocks
    const mockUsers = [
      {
        id: "user1",
        firstName: "John",
        lastName: "Doe",
        emailAddresses: [],
        primaryEmailAddressId: null,
        publicMetadata: {},
      },
    ];

    (getUsersWithRole as jest.Mock).mockResolvedValue(mockUsers);

    // Import page component
    const Page = (await import("@/app/castle/customers/page")).default;

    // Render the page
    render(await Page());

    // Assertions
    expect(getUsersWithRole).toHaveBeenCalledWith(false);
    expect(screen.getByText("Customers Management")).toBeInTheDocument();
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });

  it("renders the page with empty users array", async () => {
    // Setup mock to return empty array
    (getUsersWithRole as jest.Mock).mockResolvedValue([]);

    const Page = (await import("@/app/castle/customers/page")).default;

    // Render the page
    render(await Page());

    // First ensure mock was called, then check the argument
    expect(mockUsersTable).toHaveBeenCalled();
    // Use helper function to get props with proper typing
    const props = getMockProps<{ users: any[] }>(mockUsersTable);

    expect(props).toEqual({ users: [] });
  });

  it("passes the correct title to PageTitle component", async () => {
    // Setup mock
    (getUsersWithRole as jest.Mock).mockResolvedValue([]);

    const Page = (await import("@/app/castle/customers/page")).default;

    // Render the page
    render(await Page());

    // First ensure mock was called, then check the argument
    expect(mockPageTitle).toHaveBeenCalled();
    // Use helper function to get props with proper typing
    const props = getMockProps<{ title: string }>(mockPageTitle);

    expect(props).toEqual({ title: "Customers Management" });
  });

  it("handles error from getUsersWithRole", async () => {
    // Setup mock to throw error
    const mockError = new Error("Failed to fetch users");

    (getUsersWithRole as jest.Mock).mockRejectedValue(mockError);

    const Page = (await import("@/app/castle/customers/page")).default;

    // Expect the render to throw an error
    await expect(Page()).rejects.toThrow("Failed to fetch users");
  });
});
