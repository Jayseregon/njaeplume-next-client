import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { UsersTable } from "@/components/castle/UsersTable";
import { SerializableUser } from "@/interfaces/Castle";
import * as clerkActions from "@/actions/clerk/action";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock clerk actions
jest.mock("@/actions/clerk/action", () => ({
  setRole: jest.fn(),
  removeRole: jest.fn(),
}));

// Mock the dropdown component to avoid portal issues in testing
jest.mock("@/components/ui/dropdown-menu", () => {
  return {
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown">{children}</div>
    ),
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-trigger">{children}</div>
    ),
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dropdown-content">{children}</div>
    ),
    DropdownMenuItem: ({
      children,
      onClick,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
    }) => (
      <button data-testid="dropdown-item" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

// Mock the button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button data-testid="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock the icons
jest.mock("lucide-react", () => ({
  ArrowDown10: () => <div data-testid="arrow-down-icon" />,
  ArrowUp01: () => <div data-testid="arrow-up-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Search: () => <div data-testid="search-icon" />,
}));

// Sample user data for tests
const mockUsers: SerializableUser[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    primaryEmailAddressId: "email1",
    emailAddresses: [
      {
        id: "email1",
        emailAddress: "john@example.com",
      },
    ],
    publicMetadata: {
      role: "castleAdmin",
    },
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    primaryEmailAddressId: "email2",
    emailAddresses: [
      {
        id: "email2",
        emailAddress: "jane@example.com",
      },
    ],
    publicMetadata: {
      role: undefined,
    },
  },
  {
    id: "3",
    firstName: "Alice",
    lastName: "Johnson",
    primaryEmailAddressId: "email3",
    emailAddresses: [
      {
        id: "email3",
        emailAddress: "alice@example.com",
      },
    ],
    publicMetadata: {
      role: "castleAdmin",
    },
  },
];

describe("UsersTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to suppress expected error messages during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks after tests
    jest.restoreAllMocks();
  });

  it("renders the table with users", () => {
    render(<UsersTable users={mockUsers} />);

    // Check for column headers
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("Last Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Current Role")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();

    // Check for user data
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();

    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("Smith")).toBeInTheDocument();
    expect(screen.getByText("Johnson")).toBeInTheDocument();

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();

    expect(screen.getAllByText("castleAdmin").length).toBe(2);
    expect(screen.getByText("None")).toBeInTheDocument();

    // Check for action buttons
    expect(screen.getAllByText("Manage Role").length).toBe(3);
  });

  it("sorts users by lastName in ascending order by default", () => {
    render(<UsersTable users={mockUsers} />);

    // Get all rows
    const rows = screen.getAllByRole("row");
    // First row is header, so we start from second row (index 1)
    const firstRowCells = rows[1].querySelectorAll("td");
    const lastRowCells = rows[3].querySelectorAll("td");

    // Check that Doe (D) comes before Johnson (J) in alphabetical order
    expect(firstRowCells[1].textContent).toBe("Doe");
    expect(lastRowCells[1].textContent).toBe("Smith");
  });

  it("filters users based on search input", () => {
    render(<UsersTable users={mockUsers} />);

    // Search for Jane
    const searchInput = screen.getByPlaceholderText("Search users...");

    fireEvent.change(searchInput, { target: { value: "Jane" } });

    // Only Jane should be visible
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Smith")).toBeInTheDocument();
    expect(screen.queryByText("John")).not.toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });

    // All users should be visible again
    expect(screen.getByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();

    // Search by email
    fireEvent.change(searchInput, { target: { value: "alice@example" } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Jane")).not.toBeInTheDocument();
    expect(screen.queryByText("John")).not.toBeInTheDocument();
  });

  it("handles sorting when clicking on column headers", () => {
    render(<UsersTable users={mockUsers} />);

    // Get the First Name column header
    const firstNameHeader = screen.getByText("First Name");

    // Click to sort by First Name
    fireEvent.click(firstNameHeader);

    // Get all rows after sorting
    let rows = screen.getAllByRole("row");

    // Check if Alice (A) comes first alphabetically
    expect(rows[1].querySelector("td")?.textContent).toBe("Alice");

    // Click again to reverse the sort order
    fireEvent.click(firstNameHeader);

    // Get rows again after re-sorting
    rows = screen.getAllByRole("row");

    // Now John (J) should come first in descending order
    expect(rows[1].querySelector("td")?.textContent).toBe("John");
  });

  it("displays dropdown menu when clicking Manage Role button", () => {
    render(<UsersTable users={mockUsers} />);

    // Click on the first dropdown trigger
    const buttons = screen.getAllByTestId("dropdown-trigger");

    fireEvent.click(buttons[0]);

    // Check that dropdown content appears
    const dropdownItems = screen.getAllByTestId("dropdown-item");

    expect(dropdownItems[0]).toHaveTextContent("Make Admin");
    expect(dropdownItems[1]).toHaveTextContent("Remove Role");
  });

  it("calls setRole function when Make Admin is clicked", async () => {
    render(<UsersTable users={mockUsers} />);

    // Mock FormData
    global.FormData = jest.fn().mockImplementation(() => ({
      append: jest.fn(),
      get: jest.fn(),
    }));

    // Setup success response for setRole
    (clerkActions.setRole as jest.Mock).mockResolvedValue(undefined);

    // Click the first dropdown trigger
    const buttons = screen.getAllByTestId("dropdown-trigger");

    fireEvent.click(buttons[1]); // Click the second user's (Jane) dropdown

    // Now get all dropdown items and click "Make Admin"
    const dropdownItems = screen.getAllByTestId("dropdown-item");

    fireEvent.click(dropdownItems[0]); // Make Admin button

    // Check if setRole was called
    await waitFor(() => {
      expect(clerkActions.setRole).toHaveBeenCalled();
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith("Role Updated", {
      description: expect.stringContaining("castleAdmin"),
    });
  });

  it("calls removeRole function when Remove Role is clicked", async () => {
    render(<UsersTable users={mockUsers} />);

    // Setup success response for removeRole
    (clerkActions.removeRole as jest.Mock).mockResolvedValue(undefined);

    // Click the first dropdown trigger
    const buttons = screen.getAllByTestId("dropdown-trigger");

    fireEvent.click(buttons[0]); // Click the first user's (John) dropdown

    // Now get all dropdown items and click "Remove Role"
    const dropdownItems = screen.getAllByTestId("dropdown-item");

    fireEvent.click(dropdownItems[1]); // Remove Role button

    // Check if removeRole was called
    await waitFor(() => {
      expect(clerkActions.removeRole).toHaveBeenCalled();
    });

    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith("Role Removed", {
      description: "User role has been removed",
    });
  });

  it("handles errors from server actions", async () => {
    render(<UsersTable users={mockUsers} />);

    // Setup error response for setRole
    const mockError = new Error("Server error");

    (clerkActions.setRole as jest.Mock).mockRejectedValue(mockError);

    // Click the dropdown trigger
    const buttons = screen.getAllByTestId("dropdown-trigger");

    fireEvent.click(buttons[0]);

    // Click Make Admin
    const dropdownItems = screen.getAllByTestId("dropdown-item");

    fireEvent.click(dropdownItems[0]);

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error", {
        description: "Failed to update role",
      });
    });

    // Verify console.log was called but won't output to the test console
    expect(console.log).toHaveBeenCalled();
  });

  it("displays appropriate message when no users are found after filtering", () => {
    render(<UsersTable users={mockUsers} />);

    // Search for a non-existent user
    const searchInput = screen.getByPlaceholderText("Search users...");

    fireEvent.change(searchInput, { target: { value: "NonExistentUser" } });

    // Check for no users message
    expect(screen.getByText("No users found")).toBeInTheDocument();
  });
});
