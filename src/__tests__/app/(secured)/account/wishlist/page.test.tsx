import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WishlistPage from '@/src/app/(secured)/account/wishlist/page';
import { Category } from '@/generated/client';
import { getUserWishlist } from '@/src/actions/prisma/action';
import { toast } from 'sonner'; // Import toast for mocking

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    // Add other methods if they are used by the component
  },
}));

// Mock the server actions
jest.mock('@/src/actions/prisma/action', () => ({
  getUserWishlist: jest.fn(),
}));

// Mock the Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  );
});

// Mock the CategoryGallery component to simplify testing
jest.mock('@/src/components/product/CategoryGallery', () => ({
  CategoryGallery: ({ products, onWishlistItemRemoved }: { 
    products: any[]; 
    onWishlistItemRemoved: (id: string) => void 
  }) => (
    <div data-testid="category-gallery">
      {products.map((product) => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          {product.name}
          <button 
            data-testid={`remove-${product.id}`} 
            onClick={() => onWishlistItemRemoved(product.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock sample products for testing
const mockProducts = [
  {
    id: 'product1',
    name: 'Test Product 1',
    price: 10.99,
    description: 'Test description',
    description_fr: 'Test description FR',
    category: Category.templates,
    createdAt: new Date(),
    updatedAt: new Date(),
    zip_file_name: 'test.zip',
    slug: 'test-product-1',
    tags: [],
    images: [{ id: 'img1', productId: 'product1', url: '/test.jpg', alt_text: 'Test' }],
  },
  {
    id: 'product2',
    name: 'Test Product 2',
    price: 19.99,
    description: 'Another test description',
    description_fr: 'Another test description FR',
    category: Category.brushes,
    createdAt: new Date(),
    updatedAt: new Date(),
    zip_file_name: 'test2.zip',
    slug: 'test-product-2',
    tags: [],
    images: [{ id: 'img2', productId: 'product2', url: '/test2.jpg', alt_text: 'Test 2' }],
  },
];

describe('WishlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loading state when user auth is loading', () => {
    // Mock Clerk's useUser to return loading state
    const useUserMock = require('@clerk/nextjs').useUser;
    useUserMock.mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
    });

    render(<WishlistPage />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  test('should show sign-in required message when user is not signed in', () => {
    // Mock Clerk's useUser to return not signed in
    const useUserMock = require('@clerk/nextjs').useUser;
    useUserMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });

    render(<WishlistPage />);
    expect(screen.getByText('signInRequired')).toBeInTheDocument();
  });

  test('should show empty wishlist UI when user has no items', async () => {
    // Mock Clerk's useUser to return signed in
    const useUserMock = require('@clerk/nextjs').useUser;
    useUserMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    // Mock the getUserWishlist action to return empty array
    (getUserWishlist as jest.Mock).mockResolvedValue([]);

    render(<WishlistPage />);

    // Initially should show loading
    expect(screen.getByText('loading')).toBeInTheDocument();

    // Wait for the async data fetching to complete
    await waitFor(() => {
      expect(screen.getByText('noItemsTitle')).toBeInTheDocument();
      expect(screen.getByText('noItemsMessage')).toBeInTheDocument();
      expect(screen.getByText('goShopping')).toBeInTheDocument();
    });

    // Should have a link to the shop page
    // Use a more specific selector for the "Go Shopping" link
    const shopLink = screen.getByRole('link', { name: 'goShopping' });
    expect(shopLink).toHaveAttribute('href', '/shop');
  });

  test('should display wishlist items when user has items', async () => {
    // Mock Clerk's useUser to return signed in
    const useUserMock = require('@clerk/nextjs').useUser;
    useUserMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    // Mock the getUserWishlist action to return products
    (getUserWishlist as jest.Mock).mockResolvedValue(mockProducts);

    render(<WishlistPage />);

    // Wait for the async data fetching to complete
    await waitFor(() => {
      expect(screen.getByTestId('category-gallery')).toBeInTheDocument();
      expect(screen.getByTestId('product-product1')).toBeInTheDocument();
      expect(screen.getByTestId('product-product2')).toBeInTheDocument();
    });

    // Check for title
    expect(screen.getByText('title')).toBeInTheDocument();

    // Check for back to dashboard link
    const dashboardLink = screen.getByTestId('link');
    expect(dashboardLink).toHaveAttribute('href', '/account');
    expect(screen.getByText('backToDashboard')).toBeInTheDocument();
  });

  test('should handle wishlist item removal correctly', async () => {
    const user = userEvent.setup();
    
    // Mock Clerk's useUser to return signed in
    const useUserMock = require('@clerk/nextjs').useUser;
    useUserMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    // Mock the getUserWishlist action to return products
    (getUserWishlist as jest.Mock).mockResolvedValue(mockProducts);

    render(<WishlistPage />);

    // Wait for the async data fetching to complete
    await waitFor(() => {
      expect(screen.getByTestId('category-gallery')).toBeInTheDocument();
    });

    // Find and click remove button for first product
    const removeButton = screen.getByTestId('remove-product1');
    await user.click(removeButton);

    // After removal, the component should update and product1 should be gone
    // but product2 should still be there
    await waitFor(() => {
      expect(screen.queryByTestId('product-product1')).not.toBeInTheDocument();
      expect(screen.getByTestId('product-product2')).toBeInTheDocument();
    });
  });

  test('should handle errors when fetching wishlist', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Mock Clerk's useUser to return signed in
    const useUserMock = require('@clerk/nextjs').useUser;
    useUserMock.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });

    // Mock the getUserWishlist action to throw an error
    (getUserWishlist as jest.Mock).mockRejectedValue(new Error('Failed to fetch wishlist'));

    render(<WishlistPage />);

    // Wait for the async data fetching to complete and error to be shown
    await waitFor(() => {
      // Assert that the mocked toast.error was called
      expect(toast.error).toHaveBeenCalledWith('errorLoading');
      // Should show the empty state when an error occurs
      expect(screen.getByText('noItemsTitle')).toBeInTheDocument();
    });

    // Restore console.error
    console.error = originalConsoleError;
  });
});
