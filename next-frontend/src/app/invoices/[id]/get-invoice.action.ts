'use server'

import { cookies } from 'next/headers'

export async function getInvoice(id: string) {
	const cookiesStore = await cookies()
	const apiKey = cookiesStore.get('apiKey')?.value
	const response = await fetch(`http://localhost:8080/invoice/${id}`, {
		headers: {
			'X-API-KEY': apiKey as string,
		},
		cache: 'force-cache',
		next: {
			tags: [`accounts/${apiKey}/invoices/${id}`],
		},
	})
	return response.json()
}
