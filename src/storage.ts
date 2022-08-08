import * as fs from 'fs/promises';

async function save(path: string, data: string) {
	return await fs.writeFile(path, data);
}

export { save };
