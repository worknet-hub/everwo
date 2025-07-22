-- Function to cleanup notifications older than 1 day
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete notifications older than 1 day
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '1 day';
  
  RAISE NOTICE 'Cleaned up old notifications';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup every hour (if using pg_cron extension)
-- Note: This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-notifications', '0 * * * *', 'SELECT cleanup_old_notifications();');

-- Alternative: Create a trigger to automatically delete old notifications
-- This will run the cleanup function whenever a notification is inserted
CREATE OR REPLACE FUNCTION trigger_cleanup_old_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up old notifications when new ones are added
  PERFORM cleanup_old_notifications();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup when notifications are inserted
DROP TRIGGER IF EXISTS trigger_cleanup_notifications ON notifications;
CREATE TRIGGER trigger_cleanup_notifications
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_old_notifications(); 