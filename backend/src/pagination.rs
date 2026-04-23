// src/pagination.rs
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Pagination {
    pub page: Option<u32>,
    pub per_page: Option<u32>,
}

impl Pagination {
    pub fn limit_offset(&self) -> (i64, i64) {
        let per_page = self.per_page.unwrap_or(20).min(100) as i64;
        let page = self.page.unwrap_or(1).max(1) as i64;
        let offset = (page - 1) * per_page;
        (per_page, offset)
    }
}
