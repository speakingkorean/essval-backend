CREATE DATABASE videos;
USE videos;

CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title NVARCHAR(255) NOT NULL, /* unicode for global */
  uploaded_date TIMESTAMP NOT NULL DEFAULT NOW(),
  duration INT NOT NULL,
  date TIMESTAMP /* date of the video content */
);

INSERT INTO videos (title, duration)
VALUES 
('test1',time_to_sec('00:01:00')),
('test2',13.42), /* truncate to 13 */
('test3',1000)
;

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name NVARCHAR(64) NOT NULL
);

-- index on name

INSERT INTO tags (name)
VALUES
('tag1'),
('tag2'),
('tag3')
;

drop table videos_tags;

CREATE TABLE videos_tags (
  video_id BIGINT UNSIGNED,
  tag_id BIGINT UNSIGNED,
  PRIMARY KEY (video_id, tag_id)
  -- FOREIGN KEY (video_id) REFERENCES tags(id),
  -- FOREIGN KEY (tag_id) REFERENCES videos(id)
);

INSERT INTO videos_tags (video_id, tag_id)
VALUES
(1,1),
(1,2),
(3,1)
;


