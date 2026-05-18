import mockApi from 'src/@mock-utils/mockApi';
import { NextRequest, NextResponse } from 'next/server';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';

const storage = createStorage({
	driver: process.env.VERCEL
		? vercelKVDriver({
				url: process.env.AUTH_KV_REST_API_URL,
				token: process.env.AUTH_KV_REST_API_TOKEN,
				env: false
			})
		: memoryDriver()
});

export async function GET(req: NextRequest, props: { params: Promise<{ email: string }> }) {
	const params = await props.params;
	
	// Check unstorage first for locally created users
	const userKey = `user:email:${params.email}`;
	const storedUser = await storage.getItem(userKey);
	if (storedUser) {
		return NextResponse.json(storedUser, { status: 200 });
	}

	// Fallback to mock DB
	const api = mockApi('users');
	const item = await api.find({ email: params.email });

	if (!item) {
		return NextResponse.json({ message: 'User not found' }, { status: 404 });
	}

	return NextResponse.json(item, { status: 200 });
}
