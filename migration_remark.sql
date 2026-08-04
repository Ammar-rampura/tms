-- Add the new remark column to fee_records for payment updates
ALTER TABLE fee_records ADD COLUMN IF NOT EXISTS remark TEXT;
