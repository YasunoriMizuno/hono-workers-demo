DROP TABLE IF EXISTS items;

CREATE TABLE items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  price      INTEGER NOT NULL,
  created_at TEXT    DEFAULT (datetime('now'))
);

INSERT INTO items (name, price) VALUES ('コーヒー', 500);
INSERT INTO items (name, price) VALUES ('紅茶', 400);
