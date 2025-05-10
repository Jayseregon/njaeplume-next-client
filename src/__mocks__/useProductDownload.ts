export const useProductDownload = jest.fn((callback) => ({
  downloadingItems: {},
  handleDownload: jest.fn((item) => {
    if (callback) callback(item);
  }),
}));
