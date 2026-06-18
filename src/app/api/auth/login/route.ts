import { NextRequest, NextResponse } from 'next/server';
import mockApi from '@/@mock-utils/mockApi';

export async function POST(req: NextRequest) {
	try {
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ message: 'Email and password are required' },
				{ status: 400 }
			);
		}

		const api = mockApi('users');
		const user = await api.find({ email, password });

		if (!user) {
			return NextResponse.json(
				{ message: 'Invalid credentials' },
				{ status: 401 }
			);
		}

		const token = {
			id: user.id,
			access: `mock-access-token-${user.id}`,
			refresh: `mock-refresh-token-${user.id}`
		};

		return NextResponse.json(token, { status: 200 });
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
