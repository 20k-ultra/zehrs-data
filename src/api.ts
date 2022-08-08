import * as https from 'https';

const STORE_ID = process.env.STORE_ID;
const API_KEY = process.env.API_KEY;
const CART_ID = process.env.CART_ID;

const OPTIONS = {
	hostname: 'api.pcexpress.ca',
	port: 443,
};

const GET = async (path: string): Promise<any> => {
	const options = { ...OPTIONS, method: 'GET', path };
	return new Promise((resolve, reject) => {
		https.request(options, (res: any) => {
			let data = '';
			res.on('error', reject);
			res.on('data', (chunk: string) => {
				data += chunk;
			});
			res.on('end', () => {
				resolve(JSON.parse(data));
			});
		});
	});
};

const POST = async (path: string, payload: any): Promise<any> => {
	const payloadString = JSON.stringify(payload ? payload : '');

	const options = {
		...OPTIONS,
		path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': payloadString.length,
			'x-apikey': API_KEY,
		},
	};

	return new Promise((resolve, reject) => {
		const req = https.request(options, (res: any) => {
			let data = '';
			res.on('data', (d: string) => {
				data += d;
			});
			res.on('end', () => {
				resolve({
					response: {
						statusMessage: res.statusMessage,
						statusCode: res.statusCode,
					},
					data: JSON.parse(data),
				});
			});
		});
		req.on('error', reject);
		req.write(payloadString);
		req.end();
	});
};

async function products(
	categoryId: number,
	page: number = 0,
	items: any[] = [],
): Promise<any> {
	const size = 48;
	console.log(
		`Searching page ${page} for categoryId ${categoryId} products...`,
	);
	const response = await POST('/product-facade/v3/products/category/listing', {
		pagination: {
			from: page,
			size,
		},
		banner: 'zehrs',
		cartId: CART_ID,
		lang: 'en',
		date: '08082022',
		storeId: STORE_ID,
		pcId: null,
		pickupType: 'STORE',
		offerType: 'ALL',
		categoryId,
	});
	if (response.data.results.length === 0) {
		// Page has no items so complete getting items
		return items;
	} else if (response.data.results < size) {
		// The page didn't return a full list so no point in asking for more
		return items.concat(response.data.results);
	}
	// Wait before asking for more
	await sleep(300);
	// Try to get another page of items
	return await products(
		categoryId,
		page + 1,
		items.concat(response.data.results),
	);
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export { GET, POST, products };
