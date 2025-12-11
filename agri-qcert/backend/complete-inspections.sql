UPDATE inspections 
SET status = 'completed', completed_at = NOW() 
WHERE status = 'scheduled';

SELECT id, status, completed_at FROM inspections ORDER BY id;
