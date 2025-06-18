import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({
  PFC_CONFIG: {
    shopifyDomain: 'example.myshopify.com',
    shopifyStorefrontToken: 'token',
    debug: false
  }
}));

import { shopifyGraphQL, getCreateCheckoutMutation } from '../src/api/shopify.js';

beforeEach(() => {
  fetchMock.resetMocks();
});

test('shopifyGraphQL posts query and returns data', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ data: { ok: true } }));
  const result = await shopifyGraphQL('{test}');
  expect(fetchMock).toHaveBeenCalledWith('https://example.myshopify.com/api/2023-04/graphql.json', expect.objectContaining({ method: 'POST' }));
  expect(result).toEqual({ ok: true });
});

test('getCreateCheckoutMutation returns correct mutation string', () => {
  const mutation = getCreateCheckoutMutation('123');
  expect(mutation).toContain('checkoutCreate');
  expect(mutation).toContain('variantId: "123"');
});
