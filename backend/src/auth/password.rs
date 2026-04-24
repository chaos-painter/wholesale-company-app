use crate::error::AppError;
use bcrypt::{DEFAULT_COST, hash, verify};

pub fn hash_password(plain: &str) -> Result<String, AppError> {
    hash(plain, DEFAULT_COST).map_err(|e| AppError::internal(format!("hashing error: {e}")))
}

pub fn verify_password(plain: &str, hashed: &str) -> Result<bool, AppError> {
    verify(plain, hashed).map_err(|e| AppError::internal(format!("verification error: {e}")))
}
