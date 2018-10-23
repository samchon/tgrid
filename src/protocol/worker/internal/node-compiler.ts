export function compile(content: string): string
{
	return `${__dirname}/eval ${content}`;
}