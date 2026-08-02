export interface JwtPayload {
  sub: string;
  email: string;
}

export interface JwtRefreshPayload extends JwtPayload {
  tokenId: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
}
