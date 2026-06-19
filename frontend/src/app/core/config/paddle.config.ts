// Paddle client-side tokens and price IDs are safe for Paddle.js frontend checkout.
// Never place Paddle API keys or webhook secrets in Angular.

export const PADDLE_CONFIG = {
  environment: 'sandbox',
  clientToken: 'test_5da16323e1990f8c66ceae2cb26',
  prices: {
    proMonthly: 'pri_01kvgw60arhmpzhsxzykmf6kqw',
    proYearly: 'pri_01kvgw4kaahqzj5w6jxqs8bq0a',
    platinumMonthly: 'pri_01kvgvyr5bnh3fe4txcc509k7w',
    platinumYearly: 'pri_01kvgvt5d9ww44y6zeka7kdg7w'
  }
} as const;
