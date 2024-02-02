CREATE TABLE IF NOT EXISTS subscribers (
    subscriber_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT CHECK(title IN ('mr', 'mrs', 'ms')),
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    engagement_status VARCHAR(20) CHECK (engagement_status IN ('engaged', 'disengaged', 'potential')),
    department VARCHAR(10) CHECK (department IN ('01', '02', '04', 'payroll')),
    subscribed BOOLEAN DEFAULT TRUE,
    subscribed_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_on TIMESTAMPTZ
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name TEXT UNIQUE NOT NULL,
    CHECK (char_length(tag_name) > 0)  -- Check that tag_name is not empty
);

-- Create subscriber_tags table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS subscriber_tags (
    subscriber_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (subscriber_id, tag_id),
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(subscriber_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

-- Create a trigger function
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscribed = FALSE AND (OLD.subscribed IS NULL OR OLD.subscribed = TRUE) THEN
        NEW.unsubscribed_on = CURRENT_TIMESTAMP;
        NEW.subscribed_on = NULL;
    ELSIF NEW.subscribed = TRUE AND (OLD.subscribed IS NULL OR OLD.subscribed = FALSE) THEN
        NEW.unsubscribed_on = NULL;
        NEW.subscribed_on = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the subscribers table
CREATE TRIGGER update_subscription_trigger
BEFORE UPDATE ON subscribers
FOR EACH ROW
EXECUTE FUNCTION update_subscription_status();

-- Create a view that contains all the data for subscribers as well as the tags assigned to each user in an array
CREATE OR REPLACE VIEW subscriber_tags_view AS
SELECT
    subscribers.*,
    COALESCE(ARRAY_AGG(tags.tag_name), '{}'::text[]) AS tag_names
FROM
    subscribers
LEFT JOIN
    subscriber_tags ON subscribers.subscriber_id = subscriber_tags.subscriber_id
LEFT JOIN
    tags ON subscriber_tags.tag_id = tags.tag_id
GROUP BY
    subscribers.subscriber_id;