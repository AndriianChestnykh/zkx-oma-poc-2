/**
 * Custom error classes for the ZKX OMA application
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class PolicyError extends Error {
  constructor(
    message: string,
    public policyName?: string
  ) {
    super(message);
    this.name = 'PolicyError';
    Object.setPrototypeOf(this, PolicyError.prototype);
  }
}

export class BlockchainError extends Error {
  constructor(
    message: string,
    public txHash?: string
  ) {
    super(message);
    this.name = 'BlockchainError';
    Object.setPrototypeOf(this, BlockchainError.prototype);
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
