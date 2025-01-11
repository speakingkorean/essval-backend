
show tables;

TRUNCATE videos_tags;
TRUNCATE tags;
TRUNCATE videos;

delete from videos where title = 'vid with tags';

SELECT * FROM videos LIMIT 100;
SELECT * FROM tags LIMIT 100;
SELECT * FROM videos_tags LIMIT 100;

use videos;

use notes_app;
show full columns from notes;

SELECT * FROM notes;