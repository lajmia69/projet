// src/app/api/studio/audio/create/[accountId]/route.ts
//
// Proxies multipart audio uploads to the Django backend server-side so the
// browser never makes a cross-origin request directly (which Django rejects
// with no Access-Control-Allow-Origin for this endpoint).

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
	request: NextRequest,
	{ params }: { params: { accountId: string } }
) {
	const { accountId } = params;
	const authHeader = request.headers.get('Authorization');

	// Forward the raw multipart body as-is — do NOT call request.formData()
	// because that parses and re-serialises, potentially breaking the boundary.
	const contentType = request.headers.get('content-type') ?? '';

	let backendRes: Response;
	try {
		backendRes = await fetch(
			`https://radio.backend.ecocloud.tn/audio/create/${accountId}/`,
			{
				method: 'POST',
				headers: {
					// Forward auth token
					...(authHeader ? { Authorization: authHeader } : {}),
					// Forward the original content-type so Django gets the correct boundary
					'content-type': contentType,
				},
				// Stream the request body directly — no buffering
				// @ts-expect-error — duplex is required for streaming in Node 18+
				duplex: 'half',
				body: request.body,
			}
		);
	} catch (err) {
		console.error('[audio-proxy] fetch to backend failed:', err);
		return NextResponse.json(
			{ detail: 'Proxy could not reach the backend.' },
			{ status: 502 }
		);
	}

	const text = await backendRes.text();

	return new NextResponse(text, {
		status: backendRes.status,
		headers: { 'Content-Type': 'application/json' },
	});
}