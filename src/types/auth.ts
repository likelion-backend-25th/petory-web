export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  species: string;
  sex: string;
  birthDate: string;
  intro: string;
  address: string;
  isAgreed: boolean;
}

export interface SignUpResponse {
  id: number;
  email: string;
  status: string;
  role: string;
  createdAt: string;
  infoProvideAgreement: string | null;
}

export interface SignupAccountDraft {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
