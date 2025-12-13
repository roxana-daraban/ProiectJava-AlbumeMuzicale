// Types pentru Album
export interface Album {
    id?: number;
    title: string;
    artist: string;
    genre?: string;
    releaseYear?: number;
    recordLabel?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
  }
  
  // Types pentru User
  export interface User {
    id: number;
    username: string;
    role: string;
    enabled: boolean;
  }
  
  // Types pentru Auth
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    password: string;
    role: string;
  }
  
  export interface AuthResponse {
    token: string;
    username: string;
    role: string;
  }
  
  // Types pentru Update Role
  export interface UpdateRoleRequest {
    role: string;
  }