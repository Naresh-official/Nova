export interface User {
	id: string;
	email: string;
	name: string;
	image: string;
	accessToken: string;
	refreshToken: string;
	accessTokenExpiry: Date;
	createdAt: Date;
	updatedAt: Date;
}
