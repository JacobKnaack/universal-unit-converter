# Currency Conversion

This extension requests up-to-date currency conversion values once per day.  If the extension is configured to convert currency, and a currency value is detected or manually input, rates will be fetched per currency code.  Once currency rates are fetched they can be used as much as necessary unless a new base currency is selected.

## Architecture

Extension -> CloudFront -> Lambda -> Rates
Current Data -> Response -> CloudFront Edge Cache -> Extension

1. Web extension makes a GET request to /rate?currency=CODE.
2. CloudFront checks its edge cache. If it has a valid response for the provided currency code less than 24 hours old, it returns it instantly. (Compute cost: $0).
3. If it's a cache miss, CloudFront forwards the request to your Lambda Function URL.
4. The Lambda function runs, securely fetches the real-time rate from a 3rd-party currency provider, and returns the JSON.
5. CloudFront caches that specific JSON response based on the currency query string for exactly 86,400 seconds.

## AWS Lambda

This function will run anytime there is an expired cache or a new request for an un-cached currency code.

```javascript
/**
 * AWS Lambda function acting as a lightweight proxy for currency conversion.
 * Request method: GET
 * Request query format: https://BASE_URL/rate?code=USD
 */
export const handler = async (event) => {
    // 1. Extract and normalize the query parameters
    const queryParams = event.queryStringParameters || {};
    const baseCurrency = (queryParams.code || 'USD').toUpperCase();

    // Validate the currency code format (strictly 3 letters) to prevent injection
    if (!/^[A-Z]{3}$/.test(baseCurrency)) {
        return {
            statusCode: 400,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' 
            },
            body: JSON.stringify({ error: 'Invalid currency code format. Must be a 3-letter ISO code.' })
        };
    }

    // 2. Define your third-party API endpoint
    // Using ExchangeRate-API's open endpoint as a baseline. Update this URL if using a paid API Key.
    const apiUrl = `https://open.er-api.com/v6/latest/${baseCurrency}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Exchange rate API returned status: ${response.status}`);
        }

        const data = await response.json();

        // 3. Format and return the payload with proper caching headers
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                // CRITICAL FOR BROWSER EXTENSIONS: Allows your extension background/content scripts to fetch this data
                'Access-Control-Allow-Origin': '*', 
                // CRITICAL FOR CLOUDFRONT: Tells CloudFront to cache this specific currency's response for exactly 1 day (86400 seconds)
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600'
            },
            body: JSON.stringify({
                base: data.base_code,
                rates: data.rates,
                lastUpdated: data.time_last_update_utc
            })
        };

    } catch (error) {
        // Log errors to AWS CloudWatch for debugging
        console.error('Proxy Error:', error); 

        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error fetching currency rates.' })
        };
    }
};

```

## AWS CloudFront

This is our caching layer.  It will cache responses from the Lambda keyed to the `?code` query parameter present on the request.

1. Create the Distribution and set the origin
    * Use the Lambda URL as the origin.
2. Configure Default Cache Behavior
    * Protocol Policy: Redirect HTTP to HTTPS
    * Allowed HTTP Methods: GET, HEAD.
3. Create a custom cache policy
    * By default CloudFront will treat all parameter values the same, we need to make sure it caches different responses for different values.
    * Under Cache key and origin requests, make sure Cache policy and origin request policy is selected.
    * Next to the Cache policy dropdown, click the Create policy link (this opens a new browser tab).
    * Name your policy something descriptive, like CurrencyProxyCachePolicy.
    * Under TTL settings, you can leave them at their defaults (CloudFront will honor the 86400-second Cache-Control header sent by your Lambda function anyway).
    * Under Cache key settings -> Query strings:
        * Change the dropdown from None to Include specified query strings.
        * In the text box that appears, type code and click Add.
    * Leave everything else as default and click Create at the bottom of the page.
    * Close this tab and return to your original CloudFront setup tab. Click the Refresh icon next to the Cache policy dropdown, and select your newly created CurrencyProxyCachePolicy.
4. Finalize and Deploy
    * Scroll down to the Web Application Firewall (WAF) section. If you are just testing, you can select Do not enable security protections to avoid extra costs, though enabling it later is recommended if your extension scales up.
    * Scroll to the bottom and click Create distribution.
