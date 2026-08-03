-- Run this SQL in your Supabase SQL Editor to apply the schema updates

-- 1. Add the new columns to support scholarships
ALTER TABLE fee_records 
ADD COLUMN original_fee numeric DEFAULT 0,
ADD COLUMN scholarship_amount numeric DEFAULT 0;

-- 2. Backfill existing records to ensure mathematical consistency
-- (Existing 'amount' becomes the 'payable_amount', so original_fee must match it)
UPDATE fee_records 
SET original_fee = amount,
    scholarship_amount = 0;

-- 3. Update the allowed status values.
-- Note: Depending on whether you used a CHECK constraint or an ENUM type, 
-- you need to allow 'Skipped' as a valid status. 
-- If you used a CHECK constraint named 'fee_records_status_check':
-- ALTER TABLE fee_records DROP CONSTRAINT fee_records_status_check;
-- ALTER TABLE fee_records ADD CONSTRAINT fee_records_status_check CHECK (status IN ('Pending', 'Partially Paid', 'Paid', 'Skipped'));
