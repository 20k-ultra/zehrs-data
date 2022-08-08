import categories from './categories';
import * as storage from './storage';
import * as api from './api';

const fetch = async () => {
	let productsFound = 0;
	const data = new Map();
	for (const category of categories) {
		console.log(`Fetching ${category.name} products...`);
		const products = await api.products(category.id);
		console.log(`Found ${products.length} products...`);
		productsFound += products.length;
		data.set(category.name, {
			id: category.id,
			name: category.name,
			products,
		});
	}
	console.log(`Saving ${productsFound} products `);
	return storage.save('items.json', JSON.stringify(Object.fromEntries(data)));
};

fetch();
